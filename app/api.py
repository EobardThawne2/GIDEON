from app import create_app

app = create_app()

# Required for Vercel
app.debug = False