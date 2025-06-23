import unittest
from focus_flow_app import create_app
from sqlalchemy import select
from flask_login import logout_user
from focus_flow_app.routes.task_routes import validator
from focus_flow_app.models import Task, db

class FlaskServerTest(unittest.TestCase):
    """This class is for our backend.py server's unit tests"""
    def setUp(self):
        '''setUp this module runs before every test is executed'''
        self.app = create_app("testing") # type: ignore
      
        # Initalise the test client from our Flask App...
        self.client = self.app.test_client()
        # Push the app context, in otherwords ensure the app is the current one being pointed to...
        self.ctx = self.app.app_context()
        self.ctx.push()
        db.create_all()

        resp = self.client.post(
            "/auth/signup",
            data={"user_name": "testUser", "user_email": "testUser@gmail.com", "user_password": "testPassword"},
            follow_redirects=True
        )


        with self.client.session_transaction() as sess:
            id = int(sess["_user_id"])


        self.current_user_id = id

        self.assertEqual(resp.status_code, 200)


    def tearDown(self):
        '''tearDown this module runs after every test is excuted'''
        # We drop and remove the tables before the next unit test
        db.session.remove()
        db.drop_all()
        # Removes the app context but doesnt remove the app itself...
        self.ctx.pop()


    def create_test_task(self, name="test_name", description="test_description"):
        '''This function creates a testing Task to be used in the unit tests.'''
        test_task = Task(user_id=self.current_user_id, name=name, description=description) # type: ignore
        db.session.add(test_task)
        db.session.commit()
        return test_task
    

    def test_Root_Address(self):
        '''This is a unit test for checking our root address "/" is accessible via GET'''
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200 or 304, 'root address "/" was not accessed.')


    def test_Give_Tasks(self):
        '''This unit test checks that our dashboard is loaded correctly'''
        response = self.client.get('/task/dashboard')
        self.assertEqual(response.status_code, 200, '"/dashboard.html" failed to load correctly!')
          

    def test_Add_Task_To_Database(self):
        '''This unit test is used to check that we can add tests to our database via POST'''
        response = self.client.post('/task/tasks', json={'name': 'test name', 'description': 'testdescription', 'id': 0})
        self.assertEqual(response.status_code, 201, 'the task failed to be added in add_tasks()')


    def test_Add_Task_To_Database_Invalid_Input_Not_Json(self):
        '''This unit test checks that the body part of the response for adding tasks contains json'''
        response = self.client.post('/task/tasks', data={'name': 'test_name', 'description': 'test_description'})
        self.assertEqual(response.status_code, 400, 'the error logic for checking if the response contains json in add_tasks() failed')

    
    def test_Add_Task_To_Database_Invalid_Input_Missing(self):
        '''This unit test runs if the required data isnt given'''
        response = self.client.post('/task/tasks', json={'name': True, 'description': False})
        self.assertEqual(response.status_code, 422, 'the error logic for the validator() logic in "add_tasks()" failed')


    def test_Edit_Task_In_Database(self):
        '''This unit test checks that we can edit tasks by their id from the database using PATCH'''
        self.create_test_task()
        response = self.client.patch('/task/tasks', json={'task_name': 'test_name', 'task_description': 'test_description', 'id': 1, 'user_id': self.current_user_id})
        self.assertEqual(response.status_code, 200, 'the edit of the task within the PATCH call of add_tasks() has failed.')


    def test_Edit_Task_In_Database_Not_Json(self):
        '''This unit test ensures we are passing json in the body from send_tasks() else it fails'''
        response = self.client.patch('/task/tasks', data={'not_json': 'not json either'})
        self.assertEqual(response.status_code, 400, 'the error logic inside of the PATCH branch of add_tasks() that checks if the data is in has failed')


    def test_Edit_Task_In_Database_Missing_Data(self):
        '''This unit test checks if the send_tasks() function is passing all the required data'''
        response = self.client.patch('/task/tasks', json={'task_name': 'test_name', 'task_description': 'test_description', 'id': '1', 'user_id': self.current_user_id})
        self.assertEqual(response.status_code, 400, 'invalid! Missing Data from client!')


    def test_Delete_Task(self):
        '''This unit test checks that we can correctly delete tasks from the database via their ID'''
        test_task = self.create_test_task()
        
        stmt = select(Task).where(Task.name == test_task.name)
        result = db.session.execute(stmt).scalar_one_or_none()

        if result:
            task_id = str(result.id)
        else:
            task_id = None

        response = self.client.delete(f'/task/delete/{task_id}')
        self.assertEqual(response.status_code, 200, f"The Task with the ID:{task_id} does not exist! thus could not be deleted.")

        tasks = Task.query.all()
        self.assertNotIn(test_task, tasks, f"The Task with ID:{task_id} was not deleted!")


    def test_Delete_Task_Bad_Id(self):
        '''This unit test ensures when a Id for a task that doesnt exist is sent its caught'''
        response = self.client.delete(f'/task/delete/00')

        isTask = db.session.execute(select(Task).where(Task.id == 00)).scalar_one_or_none()
        self.assertIsNone(isTask, 'The Task with the provided ID: 00 doesnt exist. thus cant be deleted.')

        self.assertEqual(response.status_code, 404, 'deletion fail! the Task with the provided ID:00 does not exist!')


    def test_Amount_Of_Tasks(self):
        '''This unit test gets the amount of Task entries we have in our database for our current user'''
        self.create_test_task()
        response = self.client.get('/task/getTasksLength/')
        self.assertEqual(response.status_code, 200, 'failed to get the amount of Task entries for the current user!')

    
    def test_Amount_Of_Tasks_Fail(self):
        '''This unit test ensures we get notified if our Task table has no entries under the current user'''
        response = self.client.get('/task/getTasksLength/')
        self.assertEqual(response.status_code, 404, 'we arent capturing when theres no task entries in getTasksLength for the current user')


    def test_Done_Tasks(self):
        '''This unit test checks that the server is reciving the expect datatype ie JSON from done_tasks'''
        self.create_test_task()
        response = self.client.patch('/task/done/1', json={'bool': True})
        self.assertEqual(response.status_code, 200, "The task with ID:1 was unable to be marked as done in the '/task/done' route!")


    def test_Done_Tasks_Invalid_Data(self):
        '''This unit test ensures we get an error if the datatype isnt JSON from done_task'''
        response = self.client.patch('/task/done/1', data={'invalid_key': 'invalid_value'})
        self.assertEqual(response.status_code, 400, "The '/task/done' route is not correctly catching if the data sent to it isnt JOSN!")


    def test_Done_Tasks_No_Such_Task(self):
        '''This unit test gives us an error if done_tasks gives us an ID that isnt linked to a task'''
        response = self.client.patch('/task/done/00', json={"bool": True})
        self.assertEqual(response.status_code, 404, "invalid! no task with ID: 00 exists")


    def test_Done_Tasks_Invalid_KeyPair(self):
        '''This unit test gives us an error if our server recivies an incorrect key-value pair from done_tasks'''
        self.create_test_task()
        response = self.client.patch('/task/done/1', json={'bool': None})
        self.assertEqual(response.status_code, 400, "we are no longer catching incorrect key-value pairs from done_tasks!")


    def test_Create_User_Invalid_Key_Value_Input(self):
        '''This unit test ensures we are catching if an incorrect key_pair is being
        provided by our signup form.'''
        response = self.client.post("/auth/signup", data={"name": "test_name", "user_email": "test@email", "userpassword": "pass"})
        self.assertEqual(response.status_code, 422, "an invalid key-pair isnt being reported when creating a new account!")


    def test_Create_User_invalid_key_value_empty_input(self):
        '''This unit test ensures we are catching if an empty key_pair is being
        provided by our signup form.'''
        response = self.client.post("/auth/signup", data={"user_name": "", "user_email": "", "user_password": ""})
        self.assertEqual(response.status_code, 422, "An empty key-pair isnt being reported when creating a new account!")

    
    def test_Create_User_valid(self):
        '''This unit test ensures our create user route is correctly
        executing when its being given the correct data'''
        response = self.client.post("/auth/signup", data={"user_name": "testName", "user_email": "testEmail@gmail.com", "user_password": "testUserPassword"})
        self.assertEqual(response.status_code, 302, "Our create user route failed on correct data!")


    def test_Login_User_valid(self):
        '''This unit test tests for the successful case of our user login'''
        response = self.client.post("/auth/login_page", data={"user_email": "testUser@gmail.com", "user_password": "testPassword"}, follow_redirects=True)
        self.assertNotIn(b'Incorrect password', response.data, "The test user was not able to sign in as expected!")
        self.assertNotIn(b'A user with that email:', response.data, "The test user was not able to sign in as expected!")
        self.assertIn(b'Dashboard', response.data, "The test user was not able to sign in as expected!")


    def test_Login_User_Invalid_Password(self):
        '''This unit test tests for the unsuccessful case of our user login where the password does not match'''
        response = self.client.post("/auth/login_page", data={"user_email": "testUser@gmail.com", "user_password": "wrongtestPassword"}, follow_redirects=True)
        self.assertIn(b'Incorrect password!', response.data, "The test password was incorrect but not caught!")


    def test_Login_User_Invalid_Email(self):
        '''This unit test tests for the unsuccessful case of our user email not existing in the database'''
        response = self.client.post("/auth/login_page", data={"user_email": "noneExistantTestUser@gmail.com", "user_password": "testPassword"}, follow_redirects=True)
        self.assertIn(b'A user with the email:', response.data, "The test email was not pressent in the database but didnt fail!")


    def test_Logout_User_Valid(self):
        '''This unit test ensures that our logout route is functioning as expected'''
        response = self.client.post("/auth/logout")
        self.assertEqual(response.status_code, 303, "The logout for the current user failed!")



# Initalisation
if __name__ == '__main__':
    unittest.main()
