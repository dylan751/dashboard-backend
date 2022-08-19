-- create tables

-- USE db_travel_page_project; 

-- Create user table
CREATE TABLE users (
    userId SERIAL PRIMARY KEY,
    email VARCHAR(100),
    salt VARCHAR(100),
    password VARCHAR(100)
);

CREATE TABLE tours (
	tourId SERIAL PRIMARY KEY,
	title VARCHAR (255) NOT NULL,
	duration VARCHAR(20) NOT NULL, -- bao nhiêu ngày --
	startTime DATE NOT NULL,
	rating SMALLINT NOT NULL, -- 1->5 sao --
	hotel VARCHAR (60) NOT NULL,
	price DECIMAL(10, 2) NOT NULL,
	vehicle VARCHAR (30) NOT NULL,
	type VARCHAR (30) NOT NULL,
	numberOfPeople VARCHAR (10) NOT NULL,
	description TEXT,
	numberOfBooking SMALLINT,
    image VARCHAR(100),
    isTrending BOOLEAN
);

CREATE TABLE destinations (
	destinationId SERIAL PRIMARY KEY,
	tourId INT NOT NULL,
	name VARCHAR (255) NOT NULL,
	address VARCHAR (255) NOT NULL,
	description TEXT,
    content TEXT,
    image VARCHAR(100),
	FOREIGN KEY (tourId) REFERENCES tours (tourId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE forms (
	formId SERIAL PRIMARY KEY,
	tourId INT NOT NULL,
	name VARCHAR (50) NOT NULL,
	phoneNumber CHAR (13) NOT NULL,
	email VARCHAR (255) NOT NULL,
	numberOfPeople INT NOT NULL,
    startTime DATE,
    endTime DATE,
	FOREIGN KEY (tourId) REFERENCES tours (tourId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE reviews (
	reviewId SERIAL PRIMARY KEY,
	userId INT NOT NULL,
    name VARCHAR (50) NOT NULL,
    email VARCHAR(50) NOT NULL,
	tourId INT NOT NULL,
	rating SMALLINT NOT NULL,
	content TEXT NOT NULL,
	FOREIGN KEY (userId) REFERENCES users (userId) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (tourId) REFERENCES tours (tourId) ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE contacts (
	contactId SERIAL PRIMARY KEY,
    userId INT NOT NULL,
	name VARCHAR (50) NOT NULL,
	phoneNumber VARCHAR (12) NOT NULL,
	email VARCHAR(255) NOT NULL,
	title TEXT,
    description TEXT,
	FOREIGN KEY (userId) REFERENCES Users (userId) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE products (
	productId SERIAL PRIMARY KEY,
    name VARCHAR(40) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity SMALLINT,
    description TEXT,
    category VARCHAR(40),
    image VARCHAR(100),
    count SMALLINT
);

CREATE TABLE orders(
	orderId SERIAL PRIMARY KEY,
    productId INT NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (productId) REFERENCES products(productId) ON DELETE CASCADE ON UPDATE CASCADE
);
