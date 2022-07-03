import './App.css';
import { useState } from 'react';



function Billing(){

  const [items,setItems] = useState([
    {
  },
]);

  const handelInputChange = (e,id,type) =>{
    const cpyItems = [...items];
    cpyItems[id][type] = e.target.value;
    let item = cpyItems[id];
    if(type === 'rate'){
      isNaN(item.qty*item.rate)? item["total"] = 0  : item["total"] = item.qty*item.rate;
    }
    setItems(cpyItems)
  }
  const createNewItem = () =>{
    const cpyItems = [...items];
    cpyItems.push({});
    setItems(cpyItems)
  }

  const deleteItem = (id) =>{
    const cpyItems = [...items];
    cpyItems.splice(id,1)
    setItems(cpyItems)
  }

  const createTotal = () =>{
    const cpyItems = [...items];
    let ans =0;
    // console.log(cpyItems)
    cpyItems.forEach((item,id)=>{
      
      if(!isNaN(item.total)){
        ans = ans + parseInt(item.total);
      }
      console.log(ans)
    });
    // console.log(ans)
    cpyItems.push({total: ans});
    console.log(cpyItems);
    setItems(cpyItems);

  }


  return(
    <div>
      <table>
        <tr>
          <th >Sno</th>
          <th>Name of the item</th>
          <th>Description</th>
          <th>Qty</th>
          <th>Rate</th>
          <th>Total</th>
        </tr>
       
        {items.map((item,id)=>(
             <tr>
              <td className="ex-small">{id +1}</td>
              <td><input type="text" value={item.name} onChange={(e) => handelInputChange(e,id,"name")}/></td>
              <td><input type="text" value={item.description} onChange={(e) => handelInputChange(e,id,"description")}/></td>
              <td><input type="number" className="small" value={item.qty} onChange={(e) => handelInputChange(e,id,"qty")}/></td> 
              <td><input type="number" className="small" value={item.rate} onChange={(e) => handelInputChange(e,id,"rate")}/></td>
              <td><input type="text" className="small" value={item.total}/></td>
              <button onClick={() => deleteItem(id)} >Delete</button>
              {/* <input>{item.name}</input>
              <input>{item.rate}</input>
              <input>{item.qty*item.rate}</input> */}
            </tr>
        ))}
          <button onClick={() => createNewItem()}>+</button>
          <button onClick={() => createTotal()}>Total</button>
      </table>
    </div>
  )
}


function App() {

  return (
    <div className="App">
      <Billing/>
    </div>
  );
}

export default App;
