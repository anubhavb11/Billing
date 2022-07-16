import './App.css';
import { useState, useEffect } from 'react';
import Billing from './components/Billing/Billing';
import Invoice from './components/Invoice/Invoice';
import Bills from './components/Bills/Bills';
import { Button } from 'reactstrap';
import { ToastContainer, toast } from 'react-toastify';
function App() {
  const [items,setItems] = useState([
    {
      "name": "",
      "description": '',
      "qty": "",
      "rate": "",
      "amount": "",
    },{
      name: "",
      description: '',
      qty: "",
      rate: "",
      amount: "",
    },{
      name: "",
      description: '',
      qty: "",
      rate: "",
      amount: "",
    },{
      name: "",
      description: '',
      qty: "",
      rate: "",
      amount: "",
    },{
      name: "",
      description: '',
      qty: "",
      rate: "",
      amount: "",
    }
]);

const [view,setView] = useState('Bill')

  useEffect(()=>{
    const x = JSON.parse(localStorage.getItem('userOrder'));
    if(x){
    setItems(x);
    }
  },[])

  const setBillView = (items) =>{
    setItems(items);

    setView('Invoice');
    
  }

  const handelInputChange = (e,id,type) =>{
    const cpyItems = [...items];
    cpyItems[id][type] = e.target.value;
    let item = cpyItems[id];
    if(type === 'rate' || type === 'qty'){
      isNaN(item.qty*item.rate)? item["amount"] = 0  : item["amount"] = item.qty*item.rate;
    }
    setItems(cpyItems)
  }
  const createNewItem = () =>{
    const cpyItems = [...items];
    cpyItems.push({
      name: "",
      description: '',
      qty: "",
      rate: "",
      amount: "",
    });
    setItems(cpyItems)
  }

  const deleteItem = (id) =>{
    const cpyItems = [...items];
    cpyItems.splice(id,1);
    setItems(cpyItems)
  }

  const createTotal = () =>{
    const cpyItems = [...items];
    let ans =0;
    cpyItems.forEach((item,id)=>{
      if(!isNaN(item.amount)&& item.amount!=null && item.amount !== '' && !isNaN(ans)){
        console.log(ans)
        ans = ans + parseInt(item.amount);
       
      }
      console.log(ans)
    });
    return ans
  }

  const setlocal = () =>{
    toast.success("Saved !");
    localStorage.setItem('userOrder', JSON.stringify(items))
  }
  const clearItem = () =>{
    toast.success("Cleared !");
    localStorage.setItem('userOrder', JSON.stringify([
      {
        "name": "",
        "description": '',
        "qty": "",
        "rate": "",
        "amount": "",
      },{
        name: "",
        description: '',
        qty: "",
        rate: "",
        amount: "",
      },{
        name: "",
        description: '',
        qty: "",
        rate: "",
        amount: "",
      },{
        name: "",
        description: '',
        qty: "",
        rate: "",
        amount: "",
      },{
        name: "",
        description: '',
        qty: "",
        rate: "",
        amount: "",
      }
  ]))
  }

  const changeView = (master = '') =>{
    if(master === 'master'){
      setView('AllBills');
      return;
    }
    if(view === 'Bill'){
    setView('Invoice')
    }
    else{
      setView('Bill')
    }
  }

  return (
    <div className="App">
      {view === 'AllBills' &&   <Bills setBillView={setBillView}/>}
      {view === 'Bill' &&  <Billing  items = {items} handelInputChange={handelInputChange} createNewItem={createNewItem} deleteItem={deleteItem} setlocal={setlocal} createTotal={createTotal} clearItem={clearItem}/>}
      <Button color="info" className='btn' onClick={() => changeView()} >View</Button>
      {view === 'Invoice' && <Invoice items = {items} createTotal={createTotal}  />}
      <Button onClick={() => changeView("master")}>Master View</Button>
      <ToastContainer
            position="bottom-center"
            autoClose={500}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            />
    </div>
  );
}

export default App;
