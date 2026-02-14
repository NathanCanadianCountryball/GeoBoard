// historical-data.js - Historical boundary data for countries

export const historicalData = {
  "DEU": {
    "id": "DEU",
    "name": "Germany",
    "periods": [
      {
        "from": 1949,
        "to": 1990,
        "name": "Division Era",
        "states": [
          {
            "name": "West Germany (FRG)",
            "fullName": "Federal Republic of Germany",
            "color": "#4A90E2",
            "geometryUrl": "/data/west-germany.geojson"
          },
          {
            "name": "East Germany (GDR)",
            "fullName": "German Democratic Republic",
            "color": "#E85D75",
            "geometryUrl": "/data/east-germany.geojson"
          }
        ]
      }
    ]
  }
};