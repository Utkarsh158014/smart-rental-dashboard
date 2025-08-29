import { useMemo } from 'react'
import { useApp } from '../context/AppContext.jsx'

export default function BookingModal({ bike, onClose }){
	const { state, rentStart, rentEnd } = useApp()
	const activeRental = useMemo(()=> state.rentals.find(r=>r.bikeId===bike.id && !r.end), [state.rentals, bike.id])
	const ratePerMin = 2
	return (
		<div className="modal-backdrop" onClick={onClose}>
			<div className="modal" onClick={(e)=> e.stopPropagation()}>
				<header>{bike.name}</header>
				<div className="content">
					<div className="row" style={{justifyContent:'space-between'}}>
						<div>
							<div className="muted">Status</div>
							<div className="badge">{bike.status}</div>
						</div>
						<div>
							<div className="muted">Battery</div>
							<div className="badge">{bike.battery ?? '—'}%</div>
						</div>
					</div>
					{!activeRental && bike.status==='available' && (
						<div className="muted">Rate: ₹{ratePerMin}/min</div>
					)}
					{activeRental && (
						<div className="muted">Started: {new Date(activeRental.start).toLocaleTimeString()}</div>
					)}
				</div>
				<footer>
					<button className="button" onClick={onClose}>Close</button>
					{!activeRental && bike.status==='available' && (
						<button className="button primary" onClick={()=> { rentStart(bike.id); onClose() }}>Start Rental</button>
					)}
					{activeRental && (
						<button className="button primary" onClick={()=> { rentEnd(activeRental.id, ratePerMin); onClose() }}>End Rental</button>
					)}
				</footer>
			</div>
		</div>
	)
}
