def create_user(user_data: dict):
    """Placeholder logic to create a new user."""
    print(f"DATABASE: Creating user '{user_data['username']}'...")
    # In a real app, you would add the user to the database here.
    return {"status": "success", "message": f"User {user_data['username']} created."}

def delete_current_user(user_id: int):
    """Placeholder logic to delete a user."""
    print(f"DATABASE: Deleting user with ID {user_id}...")
    # In a real app, you would delete the user from the database here.
    return {"status": "success", "message": "User deleted."}

# def add_user(form):
#     users = UserModel()

#     if not assert_keys_in_form_exist(form, ['name', 'email', 'phone', 'password', 'major', 'degree']):
#         return msg.error_msg("Please check your requests.")

#     name = form['name']
#     email = form['email']
#     phone = form['phone']
#     password = form['password']
#     major = form['major']
#     degree = form['degree']

#     if name.strip() == "":
#         return msg.error_msg("Username cannot be empty.")

#     if password.strip() == "":
#         return msg.error_msg("Password cannot be empty.")

#     if len(password) < 6:
#         return msg.error_msg("Password cannot less than 6 character.")

#     if len(name) > 255:
#         return msg.error_msg("Username cannot exceed 255 characters.")

#     if len(password) > 255:
#         return msg.error_msg("Password cannot exceed 255 characters.")

#     findUser = users.get_user(email=email, enable=True)

#     if findUser is None:
#         return msg.error_msg("Failed to find user.")

#     if len(findUser) != 0:
#         return msg.error_msg("User already exists. (Email already in use)")

#     args = {
#         "Name": name,
#         "Email": email,
#         "Phone": phone,
#         "Password": encrypt(password),
#         "Major": major,
#         "Degree": degree,
#         "Enable": True
#     }
#     res = users.add_user(args)
#     if res is None:
#         return msg.error_msg("Failed to add user.")

#     return msg.success_msg({"msg": "User added successfully."})
