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
	room_id uuid NOT NULL REFERENCES rooms,
	client_id uuid NOT NULL REFERENCES clients
);

DROP FUNCTION IF EXISTS check_room();

CREATE FUNCTION check_room() RETURNS trigger AS $check_room$
	DECLARE
		occupiedCount integer;
	BEGIN
		SELECT INTO occupiedCount COUNT(room_id) FROM reservations
			WHERE room_id = NEW.room_id
				AND (start_date, end_date) OVERLAPS (NEW.start_date, NEW.end_date)
				AND client_id != NEW.client_id;

		IF occupiedCount > 0 THEN
            RAISE EXCEPTION 'Room is occupied';
        END IF;
		
		RETURN NEW;
	END;
$check_room$ LANGUAGE plpgsql;

CREATE TRIGGER check_room 
	BEFORE INSERT ON reservations
	FOR EACH ROW 
	EXECUTE FUNCTION check_room();
