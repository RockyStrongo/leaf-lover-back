-- This is an empty migration.
CREATE OR REPLACE FUNCTION update_action_on_user_plant_inactive() RETURNS TRIGGER AS $$
BEGIN
    UPDATE "Action" SET active = FALSE WHERE user_plant_id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER update_action_active_trigger
AFTER UPDATE OF active ON user_plant
FOR EACH ROW
WHEN (NEW.active = FALSE)
EXECUTE FUNCTION update_action_on_user_plant_inactive();