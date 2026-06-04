from app import create_app
#arrabca la app
app = create_app()

if __name__ == '__main__':
   app.run(host='0.0.0.0', port=5000, debug=True)
#esto es solo para local
app.run(debug=True) 