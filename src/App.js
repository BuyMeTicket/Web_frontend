import React from 'react';
//Home and Contact us
import Home from './Home';
//Activities
import Activities from './pages/ActivitiesPage';
import Activity from './pages/ActivityPage';
import AddActivity from './pages/AddActivityPage';
import MyActivity from './pages/MyActivityPage';
//Pools
import Pools from './pages/PoolsPage';
import Pool from './pages/PoolPage';
import AddPool from './pages/AddPoolPage';
import MyPool from './pages/MyPoolPage';
import MyFund from './pages/MyFundPage';
//Airdrops
// import MyAirdrops from './pages/MyAirdropsPage';
// import Airdrop from './pages/AirdropPage';
//LeaderBoard
// import LeaderBoard from './pages/LeaderBoardPage';
import MyTicket from './pages/MyTicketPage';
import Faucet from './pages/Faucet';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/styles.scss'

function App() {
    return (
        <Router>
            <Sidebar />
            <div className="wrapper d-flex flex-column min-vh-100">
                <Navbar />
                <div className="body flex-grow-1 flex-column px-3">
                <Routes>
                    
                    <Route path="/" element={<Home/>} />
                    {/* <Route path="/LeaderBoard" element={<LeaderBoard />} /> */}
                    <Route path="/Activities" element={<Activities />} />
                    <Route path="/Activity/:id" element={<Activity />} />
                    <Route path="/Activity/Add" element={<AddActivity />} />
                    <Route path="/Activity/Own" element={<MyActivity />} />
                    <Route path="/Pool/Fund" element={<MyFund />} />
                    <Route path="/Pool/Add" element={<AddPool />} />
                    <Route path="/Pool/Own" element={<MyPool />} />
                    <Route path="/Pool/:id" element={<Pool />} />
                    <Route path="/Pools" element={<Pools />} />
                    <Route path="/Faucet" element={<Faucet />} />
                    {/* <Route path="/Airdrops" element={<MyAirdrops />} />
                    <Route path="/Airdrop/:target/:id" element={<Airdrop />} /> */}
                    <Route path="/Ticket/Own" element={<MyTicket />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
        </div>
        <div className="wrapper d-flex flex-column">
            <Footer />
        </div>
        </Router>
    );
}

export default App;
