import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Pool } from 'pg';
import { ServiceReturn } from 'src/common/models/ServiceReturn';
import { Order } from './entities/order.entity';
import Collection from 'src/common/models/Collection';
import AppResponse from 'src/common/models/AppResponse';
import {
  HTTP_EXCEPTION_ERROR_CODE,
  HTTP_EXCEPTION_ERROR_MESSAGES,
} from 'src/utils/constants';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  constructor(@Inject('DATABASE_POOL') private conn: Pool) {}

  async create(createOrderDto: CreateOrderDto): Promise<ServiceReturn<Order>> {
    try {
      const { productId, quantity } = createOrderDto;

      // Check if productId exists or not
      const productQuery = await this.conn.query(
        `
          SELECT productid
          FROM products
          WHERE productid = $1
        `,
        [productId],
      );

      if (productQuery.rows.length == 0) {
        return {
          err: AppResponse.notFound(
            [HTTP_EXCEPTION_ERROR_MESSAGES.PRODUCT_DOES_NOT_EXIST],
            HTTP_EXCEPTION_ERROR_CODE.PRODUCT_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      try {
        await this.conn.query('BEGIN');

        // Create new order record
        const orderQueryInsert = await this.conn.query(
          `
            INSERT INTO orders
              (
                productId,
                quantity
              )
            VALUES ($1,$2)
            RETURNING orderid
          `,
          [productId, quantity],
        );
        const id = orderQueryInsert.rows[0].orderid;
        await this.conn.query('COMMIT');

        const { err, data } = await this.findOne(id);

        if (data && !err) {
          const orderInfo = data as Order;
          return {
            err: null,
            data: {
              orderId: id,
              productId: orderInfo.productId,
              quantity: orderInfo.quantity,
            },
          };
        }
        return {
          err,
          data: null,
        };
      } catch (error) {
        await this.conn.query('ROLLBACK');
        throw error;
      }
    } catch (error) {
      this.logger.log(error);

      this.logger.log(
        `create error: ${
          error.response ? error.response.data.msg : error.message
        }`,
      );

      return {
        err: AppResponse.internalServerError(
          [error.message],
          HTTP_EXCEPTION_ERROR_CODE.ORDER_CREATE_FAILED,
        ),
        data: null,
      };
    }
  }

  async findAll(
    limit: number,
    offset: number,
  ): Promise<ServiceReturn<Collection<Order>>> {
    try {
      let query = `
        SELECT
          orderid,
          productid,
          quantity
        FROM orders
      `;

      if (limit >= 0 && offset >= 0) {
        query += `LIMIT ${limit} OFFSET ${offset};`;
      }

      const orders = await this.conn.query(query);
      // Update code findAll
      const collection: Collection<Order> = {
        edges: orders.rows.map((row) => ({
          orderId: row.orderid,
          productId: row.productid,
          quantity: row.quantity,
        })),
        pageInfo: {
          limit: limit || 0,
          offset: offset || 0,
          total: orders.rows.length || 0,
        },
      };

      // Sort result array
      collection.edges.sort((a, b) => (a.orderId > b.orderId ? 1 : -1));

      return {
        err: null,
        data: collection,
      };
    } catch (error) {
      this.logger.log(`findAll error: ${error.message}`);
      return {
        err: AppResponse.internalServerError(
          [error.message],
          HTTP_EXCEPTION_ERROR_CODE.ORDER_LIST_FAILED,
        ),
        data: null,
      };
    }
  }

  async findOne(id: number): Promise<ServiceReturn<Order>> {
    try {
      const { rows: orderData } = await this.conn.query(
        `
          SELECT
            orderid,
            productid,
            quantity
          FROM orders
          WHERE orders.orderId = $1
          `,
        [id],
      );

      const order: Order = orderData[0]
        ? {
            orderId: id,
            productId: orderData[0].productid,
            quantity: orderData[0].quantity,
          }
        : null;

      return {
        err: null,
        data: order as Order,
      };
    } catch (error) {
      this.logger.log(`findOne error: ${error.message}`);
      if (error.name === 'NotFoundError') {
        return {
          err: AppResponse.notFound(
            [error.message],
            HTTP_EXCEPTION_ERROR_CODE.ORDER_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      return {
        err: AppResponse.internalServerError(
          [error.message],
          HTTP_EXCEPTION_ERROR_CODE.ORDER_FIND_FAILED,
        ),
        data: null,
      };
    }
  }

  async update(
    id: number,
    updateOrderDto: UpdateOrderDto,
  ): Promise<ServiceReturn<Order>> {
    try {
      const { productId, quantity } = updateOrderDto;
      let query = 'UPDATE orders SET';

      // Query order
      const queryOrder = await this.conn.query(
        `
          SELECT
            orderId
          FROM orders
          WHERE orderId = $1
        `,
        [id],
      );

      // Check order exist
      if (queryOrder.rows.length === 0) {
        return {
          err: AppResponse.notFound(
            [HTTP_EXCEPTION_ERROR_MESSAGES.ORDER_DOES_NOT_EXIST],
            HTTP_EXCEPTION_ERROR_CODE.ORDER_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      await this.conn.query('BEGIN');

      // Update productId
      if (productId) {
        query += ` productId = \'${productId}\',`;
      }

      // Update quantity
      if (quantity) {
        query += ` quantity = \'${quantity}\'`;
      }

      query += `WHERE orderid = \'${id}\'`;

      await this.conn.query(query);

      await this.conn.query('COMMIT');

      return {
        err: null,
        data: {},
      };
    } catch (error) {
      await this.conn.query('ROLLBACK');

      this.logger.log(`update error: ${error.message}`);
      if (error.message === 'NOT_FOUND') {
        return {
          err: AppResponse.notFound(
            [HTTP_EXCEPTION_ERROR_MESSAGES.ORDER_DOES_NOT_EXIST],
            HTTP_EXCEPTION_ERROR_CODE.ORDER_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      return {
        err: AppResponse.internalServerError(
          [error.message],
          HTTP_EXCEPTION_ERROR_CODE.ORDER_UPDATE_FAILED,
        ),
        data: null,
      };
    }
  }

  async delete(id: number): Promise<ServiceReturn<any>> {
    // TODO: Check cannot delete if some tables refencing this table
    try {
      const order = await this.conn.query(
        `
          SELECT
            orderid
          FROM orders
          WHERE orderid = $1
        `,
        [id],
      );

      if (!order.rows[0]) {
        return {
          err: AppResponse.notFound(
            [HTTP_EXCEPTION_ERROR_MESSAGES.ORDER_DOES_NOT_EXIST],
            HTTP_EXCEPTION_ERROR_CODE.ORDER_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      const orderId = order.rows[0].orderid;

      // TRANSACTION
      await this.conn.query('BEGIN');

      // Remove form
      await this.conn.query('DELETE from orders WHERE orderid = $1;', [
        orderId,
      ]);

      await this.conn.query('COMMIT');

      return {
        err: null,
        data: {},
      };
    } catch (error) {
      await this.conn.query('ROLLBACK');
      this.logger.log(`delete error: ${error.message}`);

      return {
        err: AppResponse.internalServerError(
          [error.message],
          HTTP_EXCEPTION_ERROR_CODE.ORDER_DELETE_FAILED,
        ),
        data: null,
      };
    }
  }
}
