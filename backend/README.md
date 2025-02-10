для входа в пространство
venv\Scripts\activate  

pip install -r requirements.txt
pip freeze > requirements.txt

запуск
uvicorn app.main:app --reload


Выход из виртуального пространства
deactivate

для миграций
alembic init alembic уже сделал
чтобы мигрировать:
alembic upgrade head 