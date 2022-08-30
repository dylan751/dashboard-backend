import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Pool } from 'pg';
import { Product } from './entities/product.entity';
import { ServiceReturn } from 'src/common/models/ServiceReturn';
import Collection from 'src/common/models/Collection';
import AppResponse from 'src/common/models/AppResponse';
import {
  HTTP_EXCEPTION_ERROR_CODE,
  HTTP_EXCEPTION_ERROR_MESSAGES,
} from 'src/utils/constants';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  constructor(@Inject('DATABASE_POOL') private conn: Pool) {}

  async create(
    createProductDto: CreateProductDto,
  ): Promise<ServiceReturn<Product>> {
    try {
      const { name, price, quantity, description, category, image, count } =
        createProductDto;

      try {
        await this.conn.query('BEGIN');

        // Create new product record
        const productQueryInsert = await this.conn.query(
          `
            INSERT INTO products
              (
                name,
                price,
                quantity,
                description,
                category,
                image,
                count
              )
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            RETURNING productid
          `,
          [name, price, quantity, description, category, image, count],
        );
        const id = productQueryInsert.rows[0].productid;
        await this.conn.query('COMMIT');

        const { err, data } = await this.findOne(id);

        if (data && !err) {
          const productInfo = data as Product;
          return {
            err: null,
            data: {
              productId: id,
              name: productInfo.name,
              price: productInfo.price,
              quantity: productInfo.quantity,
              description: productInfo.description,
              category: productInfo.category,
              image: productInfo.image,
              count: productInfo.count,
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
          HTTP_EXCEPTION_ERROR_CODE.PRODUCT_CREATE_FAILED,
        ),
        data: null,
      };
    }
  }

  async findAll(
    limit: number,
    offset: number,
  ): Promise<ServiceReturn<Collection<Product>>> {
    try {
      let query = `
        SELECT
          productid,
          name,
          price,
          quantity,
          description,
          category,
          image,
          count,
          striptid
        FROM products
      `;

      if (limit >= 0 && offset >= 0) {
        query += `LIMIT ${limit} OFFSET ${offset};`;
      }

      const products = await this.conn.query(query);
      // Update code findAll
      const collection: Collection<Product> = {
        edges: products.rows.map((row) => ({
          productId: row.productid,
          name: row.name,
          price: row.price,
          quantity: row.quantity,
          description: row.description,
          category: row.category,
          image: row.image,
          count: row.count,
          stripeId: row.stripeid,
        })),
        pageInfo: {
          limit: limit || 0,
          offset: offset || 0,
          total: products.rows.length || 0,
        },
      };

      // Sort result array
      collection.edges.sort((a, b) => (a.productId > b.productId ? 1 : -1));

      return {
        err: null,
        data: collection,
      };
    } catch (error) {
      this.logger.log(`findAll error: ${error.message}`);
      return {
        err: AppResponse.internalServerError(
          [error.message],
          HTTP_EXCEPTION_ERROR_CODE.PRODUCT_LIST_FAILED,
        ),
        data: null,
      };
    }
  }

  async findOne(id: number): Promise<ServiceReturn<Product>> {
    try {
      const { rows: productData } = await this.conn.query(
        `
          SELECT
            productid,
            name,
            price,
            quantity,
            description,
            category,
            image,
            count 
          FROM products
          WHERE products.productId = $1
          `,
        [id],
      );

      const product: Product = productData[0]
        ? {
            productId: id,
            name: productData[0].name,
            price: productData[0].price,
            quantity: productData[0].quantity,
            description: productData[0].description,
            category: productData[0].category,
            image: productData[0].image,
            count: productData[0].count,
          }
        : null;

      return {
        err: null,
        data: product as Product,
      };
    } catch (error) {
      this.logger.log(`findOne error: ${error.message}`);
      if (error.name === 'NotFoundError') {
        return {
          err: AppResponse.notFound(
            [error.message],
            HTTP_EXCEPTION_ERROR_CODE.PRODUCT_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      return {
        err: AppResponse.internalServerError(
          [error.message],
          HTTP_EXCEPTION_ERROR_CODE.PRODUCT_FIND_FAILED,
        ),
        data: null,
      };
    }
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<ServiceReturn<Product>> {
    try {
      const { name, price, quantity, description, category, image, count } =
        updateProductDto;
      let query = 'UPDATE products SET';

      // Query product
      const queryProduct = await this.conn.query(
        `
          SELECT
            productId
          FROM products
          WHERE productId = $1
        `,
        [id],
      );

      // Check product exist
      if (queryProduct.rows.length === 0) {
        return {
          err: AppResponse.notFound(
            [HTTP_EXCEPTION_ERROR_MESSAGES.PRODUCT_DOES_NOT_EXIST],
            HTTP_EXCEPTION_ERROR_CODE.PRODUCT_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      await this.conn.query('BEGIN');

      // Update name
      if (name) {
        query += ` name = \'${name}\',`;
      }

      // Update price
      if (price) {
        query += ` price = \'${price}\',`;
      }

      // Update full quantity
      if (quantity) {
        query += ` quantity = \'${quantity}\',`;
      }

      // Update full description
      if (description) {
        query += ` description = \'${description}\',`;
      }

      // Update full category
      if (category) {
        query += ` category = \'${category}\',`;
      }

      // Update image
      if (image) {
        query += ` image = \'${image}\',`;
      }

      // Update count
      if (count) {
        query += ` count = \'${count}\'`;
      }

      query += `WHERE productid = \'${id}\'`;

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
            [HTTP_EXCEPTION_ERROR_MESSAGES.PRODUCT_DOES_NOT_EXIST],
            HTTP_EXCEPTION_ERROR_CODE.PRODUCT_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      return {
        err: AppResponse.internalServerError(
          [error.message],
          HTTP_EXCEPTION_ERROR_CODE.PRODUCT_UPDATE_FAILED,
        ),
        data: null,
      };
    }
  }

  async delete(id: number): Promise<ServiceReturn<any>> {
    // TODO: Check cannot delete if some tables refencing this table
    try {
      const product = await this.conn.query(
        `
          SELECT
            productid
          FROM products
          WHERE productid = $1
        `,
        [id],
      );

      if (!product.rows[0]) {
        return {
          err: AppResponse.notFound(
            [HTTP_EXCEPTION_ERROR_MESSAGES.PRODUCT_DOES_NOT_EXIST],
            HTTP_EXCEPTION_ERROR_CODE.PRODUCT_DOES_NOT_EXIST,
          ),
          data: null,
        };
      }

      const productId = product.rows[0].productid;

      // TRANSACTION
      await this.conn.query('BEGIN');

      // Remove form
      await this.conn.query('DELETE from products WHERE productid = $1;', [
        productId,
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
          HTTP_EXCEPTION_ERROR_CODE.PRODUCT_DELETE_FAILED,
        ),
        data: null,
      };
    }
  }

  async getProductCategoryPieChart() {
    let query = '';
    const data = [];

    // The range of prices
    const categoryArr = ['Valie', 'Shirt', 'Bag', 'Shoes'];
    query = `
      SELECT SUM(quantity) as sum
      FROM products
      GROUP BY category
    `;
    const res = await this.conn.query(query);

    categoryArr.map((category, index) => {
      data.push({
        x: category,
        y: Number(res.rows[index].sum),
        text: res.rows[index].sum,
      });
    });

    return data;
  }
}
