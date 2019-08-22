/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 * @lint-ignore-every XPLATJSCOPYRIGHT1
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, TouchableOpacity, PermissionsAndroid} from 'react-native';
import haversine from 'haversine';
import axios from 'axios';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});


export default class App extends Component {
  
  constructor(){
    super();
    this.state={
      start: false, 
      longitude: 0, 
      latitude: 0, 
      speed: 0, 
      distance: 0, 
      previousLocation: {}, 
      moving: false, 
      totalPrice: 0, 
      subCharges: 0,
      watingCharges: 0,
      basePrice: 3.73, 
      incriment: 0.25,
      waitingTime: 0.00,
      seconds: 0,

      distanceMileStone: 130, 
      delayMileStone: 35
      

    }

    this.intervalFunction = 0;
    this.waitingIntervalFunction = 0;
    PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
       
      }
    ).then(granted => {
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("You can use GPS")
    } else {
      console.log("GPS location denied")
    }
    }).catch(err => {
      console.log(err)
    })
  }
  setStartState = (value) => {
    if(value){
      this.setState({totalPrice: 3.73});
      this.setState({waitingTime: 0});
      this.setState({subCharges: 0});
      this.setState({distance: 0});
      this.setState({waitingPrice: 0})
      this.setState({seconds: 1})
      this.setState({moving: true});
      
      navigator.geolocation.getCurrentPosition(position =>  this.setState({previousLocation: {longitude: position.coords.longitude, latitude: position.coords.latitude }}))
       this.intervalFunction = setInterval(this.updateLocation, 5000);
    }else{
      clearInterval(this.intervalFunction);
      clearInterval( this.waitingIntervalFunction);
     
    }
    this.setState({start: value})
  }


  
  componentDidMount(){
  
   
  }

  updateLocation = async () => {
    console.log("Calling Function")
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("wokeeey");
        console.log(position);
        this.setState({latitude: position.coords.latitude}); 
        this.setState({longitude: position.coords.longitude});
        this.setState({speed: position.coords.speed});
        this.updateMatrix(position.coords);
        
        this.setState({previousLocation: {longitude: position.coords.longitude, latitude: position.coords.latitude }});
      },
      (error) => this.setState({ error: error.message }),
      { enableHighAccuracy: true, timeout: 200000, maximumAge: 1000 },
    );
  }
  
  calculateDistanceCost = (d1, d2) => {
   let md1 = d1.toFixed(3)*1000;
  let md2 = md1+d2;
    if(md2-md1 !== 0){
      for (let index = md1; index <= md2; index++) {
          md1++;
          if(md1%this.state.distanceMileStone === 0){
            this.setState({subCharges: this.state.subCharges+0.25});
          }
      }
    }
  }

  calculateWaitingCost = () => {
    if(this.state.seconds%this.state.delayMileStone === 0){
      this.setState({watingCharges: this.state.watingCharges+this.state.incriment})
    }
  }

  calculateTotalCost = () => {
    this.setState({totalPrice: this.state.subCharges+ this.state.watingCharges+ this.state.basePrice});
  }

  updateMatrix = (coords) =>{
    console.log("Calculating .... ");
    console.log(coords);
    let longi = coords.longitude;
    let latti = coords.latitude;

    console.log(`logn ${longi} latti: ${latti}`);
    let distance = haversine(this.state.previousLocation , {longitude: longi, latitude: latti }, {unit: 'meter'});
  

    if(distance<=0){
      if(this.state.moving){
       this.waitingIntervalFunction = setInterval(() => {
         this.setState({waitingTime: this.state.waitingTime+0.01})
          this.setState({seconds: this.state.seconds+1});
          this.calculateWaitingCost();
      }, 1000 );
    }
      this.setState({moving: false});
      
    }else{
      clearInterval( this.waitingIntervalFunction);
      this.setState({moving: true});
      this.setState({distance: this.state.distance+(distance/1000)});
      this.calculateDistanceCost(this.state.distance, distance);/// first is distance in KM second is delta in meters
      // this.setState({watingCharges: ((this.state.waitingTime/0.25)*0.25) });
      // this.setState({subCharges: ((this.state.distance / 130)*this.state.incriment)});
      console.log("Price");
      // console.log(this.state.basePrice+ ((this.state.distance / 130)*this.state.incriment));
      // this.setState({totalPrice: this.state.basePrice+ ((this.state.distance / 130)*this.state.incriment) })
    }
    console.log(distance);
    console.log("MyDistance");
    console.log(distance);
    this.calculateTotalCost();
  }

  render() {
    return (
      <View style={styles.container}>
          <View style={{width: "100%", height: 150}}>
            <View style={{flex: 2, alignItems: "center", backgroundColor: this.state.start?"#228B22":"#B22211" }}>
                <Text style={{fontSize: 25, color: "white"}}>DistanceMeter</Text>
            </View>
            <View style={{flex: 6}}>
                <Text style={{fontSize: 70, alignSelf:"center"}}>${this.state.totalPrice.toFixed(2)}</Text>
            </View>
          </View>
          <View style={styles.row1}>
             <View style={styles.row1Box}>
                <View style={styles.row1BoxItem}>
                  <View style={styles.row1BoxItemUpper}>
                    <Text style={styles.row1BoxItemUpperText}>DIST.</Text>
                  </View>
                  <View style={styles.row1BoxItemBottom}>
                    <Text style={styles.row1BoxItemBottomText}>{this.state.distance.toFixed(2)}</Text>
                  </View>
                </View>
                <View style={styles.row1BoxItem}>
                  <View style={styles.row1BoxItemUpper}>
                    <Text style={{fontSize: 15, color: this.state.moving? "green": "orange"}}>WAIT MIN.</Text>
                  </View>
                  <View style={styles.row1BoxItemBottom}>
                    <Text style={styles.row1BoxItemBottomText}>{this.state.waitingTime.toFixed(2)}</Text>
                  </View>
                </View>
                <View style={styles.row1BoxItem}>
                  <View style={styles.row1BoxItemUpper}>
                    <Text style={styles.row1BoxItemUpperText}>CHARGE.</Text>
                  </View>
                  <View style={styles.row1BoxItemBottom}>
                    <Text style={styles.row1BoxItemBottomText}>{this.state.subCharges.toFixed(2)}</Text>
                  </View>
                </View>
                <View style={styles.row1BoxItem}>
                  <View style={styles.row1BoxItemUpper}>
                    <Text style={styles.row1BoxItemUpperText}>EXTRA.</Text>
                  </View>
                  <View style={styles.row1BoxItemBottom}>
                    <Text style={styles.row1BoxItemBottomText}>{this.state.watingCharges.toFixed(2)}</Text>
                  </View>
                </View>
             </View>
          
          </View>


          <View style={styles.row2}>
              <TouchableOpacity onPress={() => this.setStartState(true)} style={styles.row2Box0}>
                  <Text style={styles.row2BoxText}>START</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => this.setStartState(false)} style={styles.row2Box1}>
                  <Text style={styles.row2BoxText}>STOP</Text>
              </TouchableOpacity>
            

          </View>
          <Text>Longitude: {this.state.longitude}   Lattitude:{this.state.latitude}   speed: {this.state.speed}  </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    backgroundColor: '#F5FCFF',
  },
  row1:{width: "100%", height: 150, flexDirection: "row"}, 
  row1Box: {flex: 1, flexDirection:"row"}, 
  row1BoxItem: {flex: 1, flexDirection: "column"},
  row1BoxItemUpper: {flex: 1, justifyContent: "center", alignItems: "center"},
  row1BoxItemBottom: {flex: 1, justifyContent: "center", alignItems:"center" ,borderRightWidth: 1 , borderColor: "black"}, 
  row1BoxItemUpperText: {fontSize: 15}, 
  row1BoxItemBottomText: {fontSize: 25}, 

  row2: {
      width: "100%", 
      height: 100,
      flexDirection: "row", 
      marginTop: 50
  }, 
  row2Box0: {
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
   
    backgroundColor: "#228B22"
  }, 
  row2Box1: {
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: "#B22222"
  },  
  row2BoxText:{
    fontSize: 40, 
    color: 'white'
  }

});
