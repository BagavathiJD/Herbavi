CREATE TABLE IF NOT EXISTS measurements (
  id          VARCHAR(50)  PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  status      ENUM('Enabled', 'Disabled') NOT NULL DEFAULT 'Enabled',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_names (
  id          VARCHAR(50)  PRIMARY KEY,
  name        VARCHAR(255) NOT NULL UNIQUE,
  status      ENUM('Enabled', 'Disabled') NOT NULL DEFAULT 'Enabled',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id              VARCHAR(50) PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  image_url       MEDIUMTEXT,
  measurement_id  VARCHAR(50) NOT NULL,
  price           DECIMAL(10,2) NOT NULL,
  status          ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_products_measurement
    FOREIGN KEY (measurement_id) REFERENCES measurements(id)
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS customers (
  id            VARCHAR(50) PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  phone         VARCHAR(50),
  total_orders  INT NOT NULL DEFAULT 0,
  total_spend   DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status        ENUM('Active', 'Blocked') NOT NULL DEFAULT 'Active',
  join_date     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_name     VARCHAR(100) NOT NULL,
  password      VARCHAR(255) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  phone_number  VARCHAR(15)  NOT NULL,
  role          ENUM('Admin', 'Staff') NOT NULL DEFAULT 'Admin',
=======
  id            VARCHAR(50) PRIMARY KEY,
  user_name     VARCHAR(200) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password      VARCHAR(255) NOT NULL,
  phone_number  VARCHAR(50),
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id                VARCHAR(50) PRIMARY KEY,
  user_id           VARCHAR(50) NOT NULL,
  user_name         VARCHAR(200) NOT NULL,
  product_id        VARCHAR(50) NOT NULL,
  product_name      VARCHAR(255) NOT NULL,
  product_image_url MEDIUMTEXT,
  quantity          INT NOT NULL,
  measurement_name  VARCHAR(100) NOT NULL,
  price             DECIMAL(10,2) NOT NULL,
  total_amount      DECIMAL(10,2) NOT NULL,
  order_status      ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Pending',
  order_date        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_orders_product
    FOREIGN KEY (product_id) REFERENCES products(id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_orders_customer
    FOREIGN KEY (user_id) REFERENCES customers(id)
    ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS schema_migrations (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  filename    VARCHAR(255) NOT NULL UNIQUE,
  applied_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
