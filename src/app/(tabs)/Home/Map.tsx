import React, { useState, useEffect } from "react";
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { StyleSheet, View } from "react-native";
import * as Location from "expo-location";
import { Text } from "@/src/components/Themed";
import { fetchEvents } from "@/src/Utils/api";
import Loading from "@/src/components/Loading";

interface Event {
  date: string;
  description: string | null;
  event_id: number;
  host_id: string;
  image: string | null;
  location: {
    latitude: number;
    longitude: number;
  };
  max_attendees: number | null;
  title: string;
}


export default function Map() {


    const [userLocation, setUserLocation] = useState<Location.LocationObject | {}>({});
    const [initialRegion, setInitialRegion] = useState({
      latitude: 54.7024,
      longitude: -3.2765,
      latitudeDelta: 10,
      longitudeDelta: 10,
    });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true)

  const getLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      console.log(status);
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
    }
  };

  useEffect(() => { 
    setIsLoading(true)
    fetchEvents().then((data) => {
    
      if (data && data.data) {
        setEvents(data.data);
        setIsLoading(false)
      } else {
        console.error("Error fetching events: Invalid data format");
      }
    });


    getLocationPermission().then(() => {
        Location.getCurrentPositionAsync({})
          .then((acquiredLocation) => {
            setUserLocation({
              latitude: acquiredLocation.coords.latitude,
              longitude: acquiredLocation.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            });
         
          })
          .catch((error) => {
            console.error("Error getting location:", error);
          });
      });
    }, []);


    
    if(isLoading){
         return <Loading/>
      }
      else{

        return (
          <View style={styles.container}>
            <Text>{errorMsg}</Text>
    
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={initialRegion}
              showsUserLocation
              showsMyLocationButton
            >
              {events.map((event) => {
    
                return (
                  <Marker
                    key={event.event_id}
                    coordinate={{
                      latitude: event.location.latitude,
                      longitude: event.location.longitude,
                    }}>
                      <Callout>
                        <View style= {{padding: 5}}>
                          <Text style={{fontSize: 15}} >{event.title}</Text>
                        </View>
                      </Callout>

                    </Marker>
                  
                );
              })}
            </MapView>
          </View>
        );
      }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    marginTop: -14,
    width: "100%",
    height: "100%",
  },
});
