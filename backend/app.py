from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from models import db, User, TodoList, TodoItem, SharedList

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todo.db'
app.config['JWT_SECRET_KEY'] = 'your_secret_key'

db.init_app(app)
jwt = JWTManager(app)

with app.app_context():
    db.create_all()

# User registration
@app.post('/register')
def register():
    username = request.json.get('username')
    password = request.json.get('password')
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400
    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    user = User(username=username, password=hashed_pw)
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User created"}), 201

# User login
@app.post('/login')
def login():
    username = request.json.get('username')
    password = request.json.get('password')
    user = User.query.filter_by(username=username).first()
    if user and bcrypt.check_password_hash(user.password, password):
        # Notice the str(user.id) casting here:
        access_token = create_access_token(identity=str(user.id))
        return jsonify(access_token=access_token)
    return jsonify({"error": "Invalid credentials"}), 401


# Create list
@app.route('/lists', methods=['POST'])
@jwt_required()
def create_list():
    user_id = get_jwt_identity()
    name = request.json.get('name')
    new_list = TodoList(user_id=user_id, name=name)
    db.session.add(new_list)
    db.session.commit()
    return jsonify({"id": new_list.id}), 201

#delete list
@app.route('/lists/<int:list_id>', methods=['DELETE'])
@jwt_required()
def delete_list(list_id):
    user_id = get_jwt_identity()
    list_to_delete = TodoList.query.filter_by(id=list_id, user_id=user_id).first()
    if not list_to_delete:
        return jsonify({"error": "List not found"}), 404
    db.session.delete(list_to_delete)
    db.session.commit()
    return jsonify({"message": "List deleted successfully"}), 200

# Add items to list
@app.route('/lists/<int:list_id>/items', methods=['POST'])
@jwt_required()
def add_item(list_id):
    content = request.json.get('content')
    item = TodoItem(list_id=list_id, content=content)
    db.session.add(item)
    db.session.commit()
    return jsonify({"id": item.id}), 201

#edit item in list
@app.route('/lists/<int:list_id>/items/<int:item_id>', methods=['PUT'])
@jwt_required()
def edit_item(list_id, item_id):
    content = request.json.get('content')
    item = TodoItem.query.filter_by(id=item_id, list_id=list_id).first()
    if not item:
        return jsonify({"error": "Item not found"}), 404
    item.content = content
    db.session.commit()
    return jsonify({"message": "Item updated successfully"}), 200

#delete item in list
@app.route('/lists/<int:list_id>/items/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_item(list_id, item_id):
    item = TodoItem.query.filter_by(id=item_id, list_id=list_id).first()
    if not item:
        return jsonify({"error": "Item not found"}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item deleted successfully"}), 200


#View Lists
@app.route('/lists', methods=['GET'])
@jwt_required()
def get_lists():
    user_id = int(get_jwt_identity())
    lists = TodoList.query.filter_by(user_id=user_id).all()
    return jsonify({"lists": [
        {'id': lst.id, 'name': lst.name, 'created_at': lst.created_at.isoformat()}
        for lst in lists
    ]}), 200

# Get items from a list
@app.route('/lists/<int:list_id>/items', methods=['GET'])
@jwt_required()
def get_items(list_id):
    items = TodoItem.query.filter_by(list_id=list_id).all()
    return jsonify({"items": [
        {'id': item.id, 'list_id': item.list_id, 'content': item.content, 'updated_at': item.updated_at.isoformat()}
        for item in items
    ]}), 200


# Share list with other users (view-only)
@app.post('/lists/<int:list_id>/share')
@jwt_required()
def share_list(list_id):
    share_with_user = request.json.get('username')
    user_to_share = User.query.filter_by(username=share_with_user).first()
    if not user_to_share:
        return jsonify({"error": "User not found"}), 404
    share_entry = SharedList(list_id=list_id, user_id=user_to_share.id)
    db.session.add(share_entry)
    db.session.commit()
    return jsonify({"message": "List shared successfully"}), 200


if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)