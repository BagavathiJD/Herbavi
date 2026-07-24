CREATE TABLE IF NOT EXISTS user_details (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NULL,
  full_name       VARCHAR(150) NOT NULL,
  email           VARCHAR(150) NOT NULL,
      phone_number    VARCHAR(20) NOT NULL,
      address         TEXT NULL,
      country         VARCHAR(100) NOT NULL,
  city            VARCHAR(100) NOT NULL,
  state           VARCHAR(100) NOT NULL,
  zip_code        VARCHAR(20) NOT NULL,
  delivery_method ENUM('Delivery', 'Pickup') NOT NULL DEFAULT 'Delivery',
  discount_code   VARCHAR(50) NULL,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  subtotal        DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount    DECIMAL(10,2) NOT NULL DEFAULT 0,
  cart_items      JSON NULL,
  terms_accepted  TINYINT(1) NOT NULL DEFAULT 0,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_details_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
);
