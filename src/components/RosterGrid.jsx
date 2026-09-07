import RosterCard from './RosterCard.jsx'

export default function RosterGrid({rosters}){
    return(
        <div>
          <div className="mt-9 mb-3.5 flex items-center gap-2.5 ">
            <h2 className="font-extrabold text-[16px]">Team rosters</h2>
            <div className="flex-1 h-px bg-line" />
          </div>

          <div className="grid grid-cols-1 sm:gap-cols-2 lg:grid-cols-3 gap-4 ">
            {rosters.map((team) => (
                <RosterCard key={team.id} team={team}/>
            ))}
          </div>




        </div>
    )
}