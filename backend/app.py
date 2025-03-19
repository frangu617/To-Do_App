from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_sqlalchemy import SQLAlchemy
from models import db, TodoList, TodoItem, SharedList, User

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todo.db'
app.config['JWT_SECRET_KEY'] = 'super-secret'

db.init_app(app)
jwt = JWTManager(app)

with app.app_context():
    db.create_all()
    
# User Registration
@app.post('/register')
def register():
    username = request.json.get('username')
    password = request.json.get('password')
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(username=username, password=hashed_password)
    db.session.add(user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201

# User Login
@app.post('/login')
def login():
    username = request.json.get('username')
    password = request.json.get('password')
    user = User.query.filter_by(username=username).first()
    if user and bcrypt.check_password_hash(user.password, password):
        access_token = create_access_token(identity=username)
        return jsonify({'access_token': access_token}), 200
    return jsonify({'message': 'Invalid credentials'}), 401

# Create List
@app.post('/lists')
@jwt_required()
def create_list():
    user_id = get_jwt_identity()
    name = request.json.get('name')
    new_list = TodoList(user_id=user_id, name=name)
    db.session.add(new_list)
    db.session.commit()
    return jsonify({'message': 'List created successfully', "id": new_list.id}), 201

# Add items to list
@app.post('/lists/<int:list_id>/items')
@jwt_required()
def add_item(list_id):
    content = request.json.get('content')
    item = TodoItem(list_id = list_id, content = content)
    db.session.add(item)
    db.session.commit()
    return jsonify({'message': 'Item added successfully', "id": item.id}), 201

# Share list with other users (view only)
@app.post('/lists/<int:list_id>/share')
@jwt_required()
def share_list(list_id):
    share_with_user = request.json.get('username')
    user_to_share = User.query.filter_by(username=share_with_user).first()
    if not user_to_share:
        return jsonify({'message': 'User not found'}), 404
    shared_entry = SharedList(list_id=list_id, user_id=user_to_share.id)
    db.session.add(shared_entry)
    db.session.commit()
    return jsonify({'message': 'List shared successfully'}), 200