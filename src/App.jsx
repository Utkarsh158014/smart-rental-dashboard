import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useApp } from './context/AppContext.jsx'
import BikeCard from './components/BikeCard.jsx'
import MapPage from './pages/MapPage.jsx'

function Layout({ children }){
	const { state } = useApp()
	return (
		<div style={{minHeight:'100%'}}>
			<header className="header">
				<div className="container" style={{display:'flex',alignItems:'center',gap:12,justifyContent:'space-between'}}>
					<div style={{display:'flex',alignItems:'center',gap:12}}>
						<Link to="/" className="brand" style={{display:'flex',alignItems:'center',gap:8}}>
							<img src="/logo.svg" alt="Smart Rental" width="24" height="24"/>
							Smart Rental
						</Link>
						<nav className="nav">
							<NavLink to="/" end className={({isActive})=> isActive? 'active' : ''}>Dashboard</NavLink>
							<NavLink to="/map" className={({isActive})=> isActive? 'active' : ''}>Map</NavLink>
							<NavLink to="/admin" className={({isActive})=> isActive? 'active' : ''}>Admin</NavLink>
							<NavLink to="/wallet" className={({isActive})=> isActive? 'active' : ''}>Wallet</NavLink>
						</nav>
					</div>
					<Link to="/wallet" className="wallet-pill" aria-label="Wallet balance">
						<span>₹{state.user.wallet}</span>
					</Link>
				</div>
			</header>
			<main className="container">
				{children}
			</main>
			<footer className="footer">
				<div className="container">
					<div className="footer-grid">
						<div className="footer-col">
							<div className="brand" style={{display:'inline-flex',alignItems:'center',gap:8}}>
								<img src="/logo.svg" alt="Smart Rental" width="18" height="18"/>
								Smart Rental
							</div>
							<p className="muted" style={{marginTop:8, maxWidth:420}}>IoT-style bike rental dashboard with live status, map, and wallet. Demo app for learning and prototyping.</p>
						</div>
						<div className="footer-col">
							<div className="footer-title">Quick Links</div>
							<nav className="footer-links">
								<NavLink to="/">Dashboard</NavLink>
								<NavLink to="/map">Map</NavLink>
								<NavLink to="/wallet">Wallet</NavLink>
								<NavLink to="/admin">Admin</NavLink>
							</nav>
						</div>
						<div className="footer-col">
							<div className="footer-title">Contact</div>
							<div className="muted">support@smartrental.dev</div>
							<div className="muted" style={{marginTop:6}}>Chennai · Remote</div>
							{/* Social buttons removed as requested */}
						</div>
					</div>
					<div className="footer-bottom">© {new Date().getFullYear()} Smart Rental · Built with React + JS</div>
				</div>
			</footer>
		</div>
	)
}

function DashboardPage(){
	const { kpis, state } = useApp()
	const stationsById = useMemo(()=> Object.fromEntries(state.stations.map(s=>[s.id,s.name])), [state.stations])
	return (
		<div>
			<h2 className="section-title">Dashboard</h2>
			<div className="grid kpis">
				<div className="card">
					<h3>Available</h3>
					<div className="kpi-row">
						<div className="kpi-icon kpi-green">✓</div>
						<div className="kpi">{kpis.available}</div>
					</div>
				</div>
				<div className="card">
					<h3>In Use</h3>
					<div className="kpi-row">
						<div className="kpi-icon kpi-red">●</div>
						<div className="kpi">{kpis.inUse}</div>
					</div>
				</div>
				<div className="card">
					<h3>Active Rentals</h3>
					<div className="kpi-row">
						<div className="kpi-icon kpi-blue">⏱</div>
						<div className="kpi">{kpis.active}</div>
					</div>
				</div>
				<div className="card">
					<h3>Earnings</h3>
					<div className="kpi-row">
						<div className="kpi-icon kpi-gold">₹</div>
						<div className="kpi">₹{kpis.earnings}</div>
					</div>
				</div>
			</div>
			<div style={{height:16}}/>
			<h3 className="section-title" style={{fontSize:18}}>Bikes</h3>
			<div className="list">
				{state.bikes.map(b=> (
					<BikeCard key={b.id} bike={b} stationName={stationsById[b.stationId] || '—'} />
				))}
			</div>
		</div>
	)
}

function AdminPage(){
	const { state, addBike, removeBike } = useApp()
	const [name, setName] = useState('')
	const [stationId, setStationId] = useState(state.stations[0]?.id || '')
	const [battery, setBattery] = useState(100)
	const [image, setImage] = useState('')
	return (
		<div>
			<h2 className="section-title">Admin</h2>
			<div className="row">
				<div className="card" style={{flex:2}}>
					<h3>Add Bike</h3>
					<div className="row" style={{marginTop:12}}>
						<input className="input" placeholder="Bike name" value={name} onChange={e=>setName(e.target.value)} />
						<select className="input" style={{maxWidth:260}} value={stationId} onChange={e=>setStationId(e.target.value)}>
							{state.stations.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
						</select>
						<input className="input" type="number" placeholder="Battery %" value={battery} min={0} max={100} onChange={e=>setBattery(parseInt(e.target.value||'0',10))} style={{maxWidth:160}}/>
					</div>
					<div className="row">
						<input className="input" placeholder="Image URL (optional)" value={image} onChange={e=>setImage(e.target.value)} />
					</div>
					<div className="row" style={{justifyContent:'flex-end'}}>
						<button className="button" onClick={()=>{ setName(''); setImage(''); setBattery(100); setStationId(state.stations[0]?.id||'') }}>Clear</button>
						<button className="button primary" onClick={()=>{
							addBike({ name, stationId, image, battery })
							setName(''); setImage(''); setBattery(100);
						}}>Add Bike</button>
					</div>
					<div className="muted" style={{marginTop:8}}>If no image URL is provided, a default bike image will be used.</div>
				</div>
				<div className="card" style={{flex:1}}>
					<h3>Manage Bikes</h3>
					<div className="muted" style={{marginTop:6}}>Click remove to delete a bike</div>
					<div style={{marginTop:12, display:'grid', gap:10}}>
						{state.bikes.map(b=> (
							<div key={b.id} className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
								<div className="muted" style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{b.name} · {b.stationId}</div>
								<button className="button" onClick={()=> removeBike(b.id)}>Remove</button>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}

function PaymentForm(){
	const { addFunds } = useApp()
	const [amount, setAmount] = useState(100)
	const [name, setName] = useState('')
	const [card, setCard] = useState('')
	const [cvv, setCvv] = useState('')
	const [exp, setExp] = useState('')
	const [loading, setLoading] = useState(false)
	return (
		<div className="card" style={{flex:1}}>
			<h3>Add Funds</h3>
			<div className="muted" style={{marginTop:6}}>Mock payment (no real charge)</div>
			<div className="row" style={{marginTop:12}}>
				<input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Name on card"/>
			</div>
			<div className="row">
				<input className="input" value={card} onChange={e=>setCard(e.target.value)} placeholder="Card number" maxLength={19}/>
			</div>
			<div className="row">
				<input className="input" value={exp} onChange={e=>setExp(e.target.value)} placeholder="MM/YY" style={{width:120}}/>
				<input className="input" value={cvv} onChange={e=>setCvv(e.target.value)} placeholder="CVV" maxLength={4} style={{width:120}}/>
				<input className="input" type="number" value={amount} onChange={e=>setAmount(parseInt(e.target.value||'0',10))} placeholder="Amount"/>
			</div>
			<div className="row" style={{justifyContent:'flex-end'}}>
				<button className="button" onClick={()=>{ setName(''); setCard(''); setCvv(''); setExp(''); setAmount(100); }}>Clear</button>
				<button className="button primary" disabled={loading || !amount || amount<=0} onClick={async ()=>{
					setLoading(true)
					await new Promise(r=>setTimeout(r,800))
					addFunds(amount, 'Card top-up')
					setLoading(false)
				}}>Pay ₹{amount}</button>
			</div>
		</div>
	)
}

function Transactions(){
	const { state } = useApp()
	return (
		<div className="card" style={{flex:1}}>
			<h3>Transactions</h3>
			<div className="muted" style={{marginTop:6}}>Latest activity</div>
			<div style={{marginTop:12, display:'grid', gap:10}}>
				{state.transactions.length===0 && <div className="muted">No transactions yet</div>}
				{state.transactions.map(txn=> (
					<div key={txn.id} className="row" style={{justifyContent:'space-between', alignItems:'center'}}>
						<div>
							<div style={{fontWeight:700}}>{txn.type==='credit'? '+':''}₹{txn.amount}</div>
							<div className="muted" style={{fontSize:12}}>{txn.note} · {new Date(txn.createdAt).toLocaleString()}</div>
						</div>
						<span className="badge">{txn.type}</span>
					</div>
				))}
			</div>
		</div>
	)
}

function WalletPage(){
	const { state } = useApp()
	return (
		<div>
			<h2 className="section-title">Wallet</h2>
			<div className="row">
				<div className="card" style={{flexBasis:280}}>
					<div className="muted">User</div>
					<div style={{fontWeight:800}}>{state.user.name} · <span className="muted">{state.user.role}</span></div>
					<div className="muted" style={{marginTop:8}}>Balance</div>
					<div className="kpi">₹{state.user.wallet}</div>
				</div>
				<PaymentForm/>
			</div>
			<div style={{height:16}}/>
			<Transactions/>
		</div>
	)
}

export default function App(){
	return (
		<BrowserRouter>
			<Layout>
				<Routes>
					<Route path="/" element={<DashboardPage/>} />
					<Route path="/map" element={<MapPage/>} />
					<Route path="/admin" element={<AdminPage/>} />
					<Route path="/wallet" element={<WalletPage/>} />
				</Routes>
			</Layout>
		</BrowserRouter>
	)
}
