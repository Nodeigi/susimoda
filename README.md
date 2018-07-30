# SuSiMoDa (Super Simple Movie Database)

SuSiMoDa is a REST application that allows you to store some information about movies and comment them.

### Requirements
Before you install susimoda please make sure that both Docker and Minikube are installed on your machine.

### Installation

  - Clone the repository `git clone https://github.com/Nodeigi/susimoda`
  - Go to the project's directory `cd susimoda`
  - Save your OMDB API Key to an environment variable: `export SUDIMODA_OMDB_API_KEY=your_api_key`
  - `make all`

After the installation you may need to wait a while to let minikube download all neccesary images. You may check and watch status changes by calling `kubectl get pods -w`

### Usage

After the application installation you will be able to access it via `susimoda.local.io:30080`

### Example requests

Create new movie record:
```
curl -d '{"title":"Harry Potter"}' -H "Content-Type: application/json" -X POST http://susimoda.local.io:30080/movies
```

Get movies:
```
curl -X GET http://susimoda.local.io:30080/movies?page=1&items=5
```

Post a comment:

```
curl -d '{"author":"Nodeigi","content":"Lorem ipsum dolor sit amet"}' -H "Content-Type: application/json" -X POST http://susimoda.local.io:30080/movies/1/comments
```

Get movie comments:
```
curl -X GET http://susimoda.local.io:30080/movies/1/comments
```

Get all comments:
```
curl -X GET http://susimoda.local.io:30080/comments
```

