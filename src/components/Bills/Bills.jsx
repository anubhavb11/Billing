import React from 'react'
import {useEffect} from 'react'
import { useState } from 'react';
import { getDatabase, ref, onValue} from "firebase/database";
import { Button, Table } from 'reactstrap';


function Bills({setBillView}) {
    const [userData, setUserdata] = useState()
    const getUserData = () => {
        const db = getDatabase();
        const starCountRef = ref(db, '/');
        onValue(starCountRef, (snapshot) => {
            const data = snapshot.val();
            const resultArray = Object.keys(data).map(index => {
                let person = data[index];
                return person;
            });
            console.log(resultArray)
            setUserdata(resultArray);
        });
        // let refx = database().ref('userData');
        // console.log(refx)
        // ref.on('value', snapshot => {
        //     const state = snapshot.val();
        //     console.log(state)
        // });
        console.log('DATA RETRIEVED');
    }

    useEffect(() =>{
        console.log("Dws")
        getUserData();
    },[])
  return (
    <div>
        <Table>
            <thead>
                <tr>
                    <th>
                        BillNo
                    </th>
                    <th>
                        Date Time
                    </th>
                    <th>
                        Name
                    </th>
                    <th>
                        Address
                    </th>
                    <th>
                        PageView
                    </th>
                </tr>
            </thead>
            <tbody>
                {
                    userData && userData.map((item,idx)=>(
                        <tr>
                            <td>{idx+1}</td>
                            <td>{item.dateAndTime}</td>
                            <td>{item.name}</td>
                            <td>{item.cusAddress}</td>
                            <td><Button color='info'onClick={() => setBillView(item.items)} >View</Button> </td>
                        </tr>
                    ))
                }
        </tbody>
        </Table>        
    </div>
  )
}

export default Bills;
