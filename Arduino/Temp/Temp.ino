/*                                                                                                      
** getDHT11 for Autobox project                          
**                                                                                                      
** Made by Antoine GUITTET                                                                                      
** Login   <antoine.guittet@epitech.eu>                                                                        
*/

#include <dht.h>

#define dht_dpin A0 //no ; here. Set equal to channel sensor is on

dht DHT;

void setup(){
  Serial.begin(9600);
  delay(300);//Let system settle
  delay(700);//Wait rest of 1000ms recommended delay before
  //accessing sensor
}//end "setup()"

void loop(){
  //This is the "heart" of the program.
  DHT.read11(dht_dpin);

    Serial.print("humi=");
    Serial.print(DHT.humidity);
    Serial.print("=temp=");
    Serial.print(DHT.temperature); 
    Serial.println("=");
  delay(800);//Don't try to access too frequently... in theory
  //should be once per two seconds, fastest,
  //but seems to work after 0.8 second.
}// end loop()

