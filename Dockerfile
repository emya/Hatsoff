# TODO: Update to 3.7 in future
FROM python:2.7

# Create app directory
WORKDIR /usr/src/app

COPY . .

RUN pip install -r requirements.txt

EXPOSE 8080
CMD [ "python", "manage.py" "runserver"]
