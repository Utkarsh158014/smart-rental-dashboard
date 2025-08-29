import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useApp } from '../context/AppContext.jsx'

export default function MapPage(){
	const { state } = useApp()
	const center = [40.758896, -73.985130]

	function offsetPosition(lat, lng, index){
		const r = 0.0015 // ~150m
		const angle = (index % 12) * (Math.PI/6)
		return [lat + Math.sin(angle)*r, lng + Math.cos(angle)*r]
	}

	return (
		<div>
			<h2 className="section-title">Map</h2>
			<div className="card">
				<MapContainer center={center} zoom={12} scrollWheelZoom={false} style={{height:420}}>
					<TileLayer
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
					/>
					{/* Station markers */}
					{state.stations.map(st => {
						const available = state.bikes.filter(b=>b.stationId===st.id && b.status==='available').length
						const inUse = state.bikes.filter(b=>b.stationId===st.id && b.status==='rented').length
						const color = available>0? '#16a34a' : inUse>0? '#f59e0b' : '#a1a1aa'
						return (
							<CircleMarker key={st.id} center={[st.lat, st.lng]} radius={12} pathOptions={{ color, fillColor: color, fillOpacity:.35 }}>
								<Popup>
									<strong>{st.name}</strong><br/>
									Available: {available}<br/>
									In use: {inUse}
								</Popup>
							</CircleMarker>
						)
					})}

					{/* Bike markers (rendered after stations to appear on top) */}
					{state.bikes.map((b, i) => {
						const st = state.stations.find(s=> s.id === b.stationId)
						if (!st) return null
						const pos = offsetPosition(st.lat, st.lng, i)
						const color = b.status==='available'? '#16a34a' : b.status==='rented'? '#f43f5e' : '#a1a1aa'
						return (
							<CircleMarker key={b.id} center={pos} radius={6} pathOptions={{ color, fillColor: color, fillOpacity:.85 }}>
								<Popup>
									<strong>{b.name}</strong><br/>
									Status: {b.status}<br/>
									Battery: {b.battery}%<br/>
									Station: {st.name}
								</Popup>
							</CircleMarker>
						)
					})}
				</MapContainer>
			</div>
		</div>
	)
}
