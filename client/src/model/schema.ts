
type Float = number;
type Int = number;
type ID = string;
type DateTime = string;
type String=string;
type Boolean = boolean;

export interface User  {
	id?: ID 
  createdAt?: DateTime
  updatedAt?: DateTime
  // place: 
  firstName: String
  lastName?: String	
}

export interface Place  {
	id?: ID 
  createdAt?: DateTime
  updatedAt?: DateTime
  //user: User
  longName: String
  shortName
  latitude: Float
  longitude: Float
}