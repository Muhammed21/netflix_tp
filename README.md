# API 

This API endpoint allows clients to upload a CSV file containing media data for ingestion into the bdd.
POST http://localhost:3000/ingest/csv

BRUNO body -> Multipart form data with key "file" and value as the CSV file to be uploaded.

This API endpoint retrieves a list of watched media items for a specific user profile.
GET http://localhost:3000/user/watched?profileName=profileName&page=1&limit=5&mediaType=movie&year=2025


This endpoint allows clients to fetch a paginated list of media items that a user has watched, filtered by various parameters such as profile name, media type, year, and pagination options.
GET http://localhost:3000/movie?movieName=movieName&page=1&limit=20&year=2025

