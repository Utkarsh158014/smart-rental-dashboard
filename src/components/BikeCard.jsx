import { useState, useMemo } from 'react'
import BookingModal from './BookingModal.jsx'

export default function BikeCard({ bike, stationName }){
	const [open, setOpen] = useState(false)
	const color = useMemo(()=> bike.status==='available'? '#16a34a' : bike.status==='rented'? '#f43f5e' : '#a1a1aa', [bike.status])
	const fallback = 'https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?q=80&w=1200&auto=format&fit=crop'
	return (
		<div className="card">
			{(bike.image || fallback) && (
				<div style={{position:'relative', overflow:'hidden', borderRadius:12, marginBottom:12, height:220, background:'#0b0d12'}}>
					<img
						src={bike.image || fallback}
						alt={bike.name}
						onError={(e)=>{ e.currentTarget.src = fallback }}
						style={{width:'100%', height:'100%', objectFit:'contain', display:'block'}}
					/>
				</div>
			)}
			<div className="bike">
				<div>
					<h4>{bike.name}</h4>
					<div className="muted">{stationName} · <span style={{color}}>{bike.status}</span></div>
				</div>
				<button className="button" onClick={()=> setOpen(true)} disabled={bike.status==='maintenance'}>
					{bike.status==='available'? 'Rent' : bike.status==='rented'? 'Manage' : 'Unavailable'}
				</button>
			</div>
			{open && <BookingModal bike={bike} onClose={()=> setOpen(false)} />}
		</div>
	)
}
