CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    surname VARCHAR(255),
    iban VARCHAR(34)
);

INSERT INTO customers (name, surname, iban)
VALUES
    ('John', 'Doe', 'GB29NWBK60161331926819'),
    ('Alice', 'Smith', 'FR7630006000011234567890189'),
    ('Bob', 'Johnson', 'DE89370400440532013000'),
    ('Eva', 'Williams', 'IT6048390123456789012345678'),
    ('David', 'Brown', 'ES9121000418450200051332'),
    ('Sarah', 'Davis', 'NL91ABNA0417164300'),
    ('Michael', 'Miller', 'SE3550000000054910000003'),
    ('Olivia', 'Wilson', 'PL61109010140000071219812874'),
    ('James', 'Anderson', 'AT611904300234573201'),
    ('Sophia', 'Lee', 'BE68539007547034');

