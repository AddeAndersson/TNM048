import pandas as pd
import numpy as np
import json

#Read data
df = pd.read_csv('data\Temperature\GlobalLandTemperaturesByCountry.csv', encoding='utf-8')
#geo = pd.read_json('data\slim_custom.geojson')
with open('data\slim_custom.geojson') as f:
    geo = json.load(f)

#Remove parsing errors
#df['Country'] = df['Country;;'].replace({';':''}, regex=True)
#df = df.drop(['Country;;'], axis=1)

#Get names of unique countries
countries = df['Country'].unique()

#Write country names of CSV to .txt
with open('CSV_countries.txt', 'w') as f:
    for country in countries:
        f.write("%s\n" % country)

Geo_countries = []

#For each unique country
for country in countries:

    #Extract dates and average temperatures for specific country
    dates = df.loc[df['Country'] == country]['dt']
    avgTemps = df.loc[df['Country'] == country]['AverageTemperature']

    #Clean up and convert to list
    dates.reset_index(drop=True, inplace=True)
    dates = dates.tolist()
    avgTemps = avgTemps.replace({pd.np.nan: None}) #Replace NaN with None so it can be replaced by json
    avgTemps.reset_index(drop=True, inplace=True)
    avgTemps = avgTemps.tolist()

    #Find country
    for each in geo['features']:

        #Save country names of geojson
        Geo_countries.append(each['properties']['name'])

        if each['properties']['name'] == country:

            for date in dates:
                #Add key value pair
                each['properties'][date] = avgTemps[dates.index(date)]


Geo_countries = sorted(set(Geo_countries))
#Geo_countries = np.unique(Geo_countries)

#Write country names of GEO to .txt
with open('GEO_countries.txt', 'w') as f:
    for c in Geo_countries:
        f.write("%s\n" % c)

#print(geo)
with open('merged_geo.geojson', 'w') as outfile:
    json.dump(geo, outfile)

#print(geo)