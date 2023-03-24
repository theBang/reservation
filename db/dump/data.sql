INSERT INTO clients(id, login) VALUES
	('6a0482a2-dce4-491f-a1a8-aeb01a55508a', 'user_one'),
	('71650b28-e577-45a1-a83a-e97e520be45a', 'user_two'),
	('be7561a9-aa99-4e12-a78c-995e266ce145', 'user_three');

INSERT INTO rooms(id, num) VALUES
	('97e53db7-f1ac-43dd-a97a-9d7797af2db2', 1),
	('eeef4bf9-cb9a-48f9-b635-5f9f1d376798', 2),
	('92377a29-636c-479e-9c02-eb70d56f1756', 3),
	('f9b179b6-f9c1-4304-aa4a-15d26ad70fde', 4),
	('1f4ac36c-845e-4440-a219-b9df60ca2cdd', 5);

INSERT INTO reservations(start_date, end_date, room_id, client_id) 
	VALUES('2023-04-01', '2023-04-04', '97e53db7-f1ac-43dd-a97a-9d7797af2db2', '6a0482a2-dce4-491f-a1a8-aeb01a55508a');
INSERT INTO reservations(start_date, end_date, room_id, client_id) 
	VALUES('2023-04-05', '2023-04-06', '97e53db7-f1ac-43dd-a97a-9d7797af2db2', '6a0482a2-dce4-491f-a1a8-aeb01a55508a');

