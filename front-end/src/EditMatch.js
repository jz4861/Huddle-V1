import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditMatch = () => {
    const [matchDetails, setMatchDetails] = useState({
        dateAndTime: '',
        location: '',
        winner: ''
    });
    const { matchId } = useParams();
    // const [location, setLocation] = useState('');
    const navigate = useNavigate();
    console.log("Match ID:", matchId);

    useEffect(() => {
        axios.get(`http://localhost:3000/match/${matchId}`)
             .then(response => {
                console.log("Match data fetched:", response.data);
                setMatchDetails(response.data)
                // setLocation(response.data.location);
             })
             .catch(error => console.error('Error fetching match details', error));
    }, [matchId]);

    const handleChange = (e) => {
        console.log("Field name:", e.target.name);
        console.log("Field value:", e.target.value);

        setMatchDetails({ ...matchDetails, [e.target.name]: e.target.value });
    };

    // const handleLocationChange = (e) => {
    //     setLocation(e.target.value);
    // };



    const handleSubmit = (e) => {
        e.preventDefault();
        // console.log("updated match details: ", matchDetails);
        axios.post('http://localhost:3000/editmatch', matchDetails)
            .then(response => {
                console.log("Match updated successfully:", response.data);
                navigate('/MatchHistory');
            })
            .catch(error => {
                console.error('Error updating match:', error);
            });
    };

    if (!matchDetails) {
        return <div>Loading...</div>;
    }

    return (
        <div className="EditMatch"> 

        <section className="main-content">
             <form onSubmit={handleSubmit}>
             <label for="location">Location: </label>
            <input type="text" id="location" name="location" onChange={handleChange} value= {matchDetails.location}></input>
            
            <label for="winner">Winner: </label>
            <input type="text" id="winner" name="winner" onChange={handleChange} value= {matchDetails.winner}></input>
            
            <label for="date">Date: </label>
            <input type="date" id="date" name="date" onChange={handleChange} value= {matchDetails.date}></input>
            

            {/* <form onSubmit={handleSubmit}> */}
                {/* <label>Date:</label>
                <input 
                    type="date" 
                    name="dateAndTime" 
                    value={matchDetails.dateAndTime ? matchDetails.dateAndTime.split('T')[0] : ''} 
                    onChange={handleChange} 
                /> */}
                
            

            <button type="submit">Save Changes</button>
            </form>
        </section>
     </div>

        // <form onSubmit={handleSubmit}>
       
            // <div>edit the match details</div>
            // <button type="submit">Save Changes</button>
        // </form>
    );
};

export default EditMatch;
// import React from "react"
// import "./EditMatch.css"
// import { useState, useEffect } from 'react'
// import { useNavigate } from "react-router-dom";
// import axios from 'axios'
// import { Link } from "react-router-dom";


// const EditMatch = props => {
//   const jwtToken = localStorage.getItem("token");
//   let navigate = useNavigate()
//   const [isLoggedIn, setIsLoggedIn]= useState(jwtToken && true);
//   const [match, setMatch] = useState([]);
//   const [username, setUsername]= useState();
//   const [bio, setBio] = useState(match.bio);
//   const [location, setLocation]= useState(match.location);
//   const [file, setFile] = useState();
//   useEffect( () => {
//     const fetchMatch = async () => {
//       axios
//         .get("http://localhost:3000/match/${matchId}",
//         {headers: { Authorization: `JWT ${jwtToken}` },
//         // DO I NEED JWT FOR MATCH?
//     })
//         .then(response => {
//           // axios bundles up all response data in response.data property
//           const match = response.data;
//           setMatch(match);
//           setBio(match.bio);
//           setLocation(match.location);
//           setUsername(match.name);
//         })
//         .catch(err => {
//           console.log(
//             "The server rejected the request for this protected resource... we probably do not have a valid JWT token."
//           )
//           setIsLoggedIn(false);
//         })
//     }
//     fetchMatch();
//   }, []);
//   const handleChange = event =>{
//     setBio(event.target.value);
//   };
//   const handleChangeLocation = event =>{
//     setLocation(event.target.value);
//   };
//   const handleFileChange = event =>{
//     setFile(event.target.files[0]);
//   }
//   const handleUpload = (event)=>{
//     event.preventDefault();
//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('bio', bio);
//     formData.append('location', location);
//     formData.append('username',username);
//     axios
//     .post("http://localhost:3000/editmatch", formData)
//       .then(res=>{
//         console.log(res);
//         navigate("/match");
        
//       })
//       .catch(err=>{
//           console.log(err);
//       })
       
//   }

//   return (
//     <div className="EditMatch"> 

//       <section className="main-content">
//         <form action="/editmatch" method="POST" encType="multipart/form-data">
//             <img alt="welcome!" src={match.img!==undefined ? match.img: ("/defaultMatch.png")}  length = "75" width = "75"/>
//             <input type="file" onChange={handleFileChange} />
//             <label for="bio">Bio: </label>
//             <input type="text" id="bio" name="bio" onChange={handleChange} value= {bio}></input>
//             <label for="location">Location: </label>
//             <input type="text" id="location" name="location" onChange={handleChangeLocation} value = {location}></input>
//             <input type="submit" onClick={handleUpload}value="Save"/>
//         </form>

//         </section>
//     </div>
//   )
// }


// export default EditMatch