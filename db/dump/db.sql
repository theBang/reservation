CREATE ROLE admin_hotel WITH
    LOGIN
    PASSWORD '12345';

CREATE DATABASE hotel
    WITH
    OWNER = admin_hotel;
