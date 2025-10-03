from flask import Flask, render_template, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
from datetime import datetime
from .models import db, User, Workout, NutritionPlan
from .ai_models import WorkoutModel, NutritionModel

def create_app():
    app = Flask(__name__)
    app.config.from_object('config.Config')
    
    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)
    
    # Initialize AI models with error handling
    try:
        workout_model = WorkoutModel(app.config['WORKOUT_MODEL_PATH'])
        nutrition_model = NutritionModel(app.config['NUTRITION_MODEL_PATH'])
        app.logger.info("AI models initialized successfully")
    except Exception as e:
        app.logger.error(f"Error initializing AI models: {str(e)}")
        # Initialize with basic models that will be saved properly
        workout_model = WorkoutModel(app.config['WORKOUT_MODEL_PATH'])
        nutrition_model = NutritionModel(app.config['NUTRITION_MODEL_PATH'])
    
    with app.app_context():
        db.create_all()

    # Main page
    @app.route('/')
    def index():
        return render_template('index.html')

    # Profile page
    @app.route('/profile')
    def profile():
        return render_template('profile.html')

    # History page
    @app.route('/history')
    def history():
        return render_template('history.html')

    # Auth routes
    @app.route('/auth/register', methods=['POST'])
    def register():
        data = request.get_json()
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"error": "Email already registered"}), 400
            
        user = User(
            name=data['name'],
            email=data['email']
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        access_token = create_access_token(identity=user.id)
        return jsonify({
            "message": "Registration successful",
            "access_token": access_token
        }), 201

    @app.route('/auth/login', methods=['POST'])
    def login():
        data = request.get_json()
        user = User.query.filter_by(email=data['email']).first()
        
        if user and user.check_password(data['password']):
            access_token = create_access_token(identity=user.id)
            return jsonify({
                "message": "Login successful",
                "access_token": access_token
            }), 200
        
        return jsonify({"error": "Invalid credentials"}), 401

    # Workout plan API route
    @app.route('/api/workout-plan', methods=['POST'])
    def generate_workout():
        try:
            data = request.get_json()
            if not data:
                data = request.form.to_dict()  # Handle form data
            
            # Validate required fields
            if not all(key in data for key in ['goal', 'level', 'days']):
                return jsonify({"error": "Missing required fields"}), 400
                
            # Convert days to integer
            try:
                days = int(data['days'])
                if not 1 <= days <= 7:
                    return jsonify({"error": "Days must be between 1 and 7"}), 400
            except ValueError:
                return jsonify({"error": "Invalid days value"}), 400
            
            plan = workout_model.generate_plan(
                data['goal'],
                data['level'],
                days
            )
            
            # For now, we'll skip database storage since authentication is pending
            return jsonify({"plan": plan})
            
        except Exception as e:
            app.logger.error(f"Error generating workout plan: {str(e)}")
            return jsonify({"error": "Failed to generate workout plan"}), 500

    # Nutrition plan API route
    @app.route('/api/nutrition-plan', methods=['POST'])
    def generate_nutrition():
        try:
            data = request.get_json()
            if not data:
                data = request.form.to_dict()  # Handle form data
            
            # Validate required fields
            if not all(key in data for key in ['diet', 'calories']):
                return jsonify({"error": "Missing required fields"}), 400
                
            # Convert calories to integer and validate
            try:
                calories = int(data['calories'])
                if not 1000 <= calories <= 5000:
                    return jsonify({"error": "Calories must be between 1000 and 5000"}), 400
            except ValueError:
                return jsonify({"error": "Invalid calories value"}), 400
            
            plan = nutrition_model.generate_plan(
                data['diet'],
                calories
            )
            
            # For now, we'll skip database storage since authentication is pending
            return jsonify({"plan": plan})
            
        except Exception as e:
            app.logger.error(f"Error generating nutrition plan: {str(e)}")
            return jsonify({"error": "Failed to generate nutrition plan"}), 500

    # User history routes
    @app.route('/api/workouts/history', methods=['GET'])
    @jwt_required()
    def workout_history():
        user_id = get_jwt_identity()
        workouts = Workout.query.filter_by(user_id=user_id).order_by(Workout.created_at.desc()).limit(5).all()
        return jsonify([{
            'id': w.id,
            'goal': w.goal,
            'level': w.level,
            'plan': w.plan,
            'created_at': w.created_at.isoformat()
        } for w in workouts])

    @app.route('/api/nutrition/history', methods=['GET'])
    @jwt_required()
    def nutrition_history():
        user_id = get_jwt_identity()
        plans = NutritionPlan.query.filter_by(user_id=user_id).order_by(NutritionPlan.created_at.desc()).limit(5).all()
        return jsonify([{
            'id': p.id,
            'diet_preference': p.diet_preference,
            'calorie_target': p.calorie_target,
            'plan': p.plan,
            'created_at': p.created_at.isoformat()
        } for p in plans])

    return app
