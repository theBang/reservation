DROP TABLE IF EXISTS reservations;

DROP TABLE IF EXISTS rooms;
CREATE TABLE rooms 
(
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	num integer UNIQUE NOT NULL
);

DROP TABLE IF EXISTS clients;
CREATE TABLE clients 
(
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	login varchar(64)
);

CREATE TABLE reservations
(
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	start_date date NOT NULL,
	end_date date NOT NULL,
	vip boolean NOT NULL DEFAULT false,
	room_id uuid REFERENCES rooms,
	client_id uuid REFERENCES clients
);