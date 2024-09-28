import { Search, MoreHorizontal, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react'
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br'
import relativeTime from 'dayjs/plugin/relativeTime'
import { IconButton } from './icon-button'
import { Table } from './table/table'
import { TableHeader } from './table/table-header'
import { TableCell } from './table/table-cell'
import { TableRow } from './table/table-row'
import { ChangeEvent, useEffect, useState } from 'react';

dayjs.extend(relativeTime)
dayjs.locale('pt-br')

interface Attendee {
    id: string,
    name: string,
    email: string,
    createdAt: string,
    checkedInAt: string | null
}
let attendeesAll = [] as Attendee[]


export function AttendeeList() {
    const [total, setTotal] = useState(0)
    const [attendeesFilter, setAttenddesFilter] = useState<Attendee[]>([])
    
    const eventId = '7d463cf0-a486-47e0-afbc-7031d331ab20'
    const totalRows = total
    const totalPage = Math.ceil(totalRows/10)
    
    const [search, setSearch] = useState(() => {
        const url = new URL(window.location.toString())
        if (url.searchParams.has('search')){
            return url.searchParams.get('search') ?? ''
        }
        return ''
    })
    const [page, setPage] = useState(() => {
        const url = new URL(window.location.toString())
        if (url.searchParams.has('page')){
            return Number(url.searchParams.get('page'))
        }
        return 1
    })
    useEffect(() => {
        const url = new URL(`http://localhost:3000/events/${eventId}/attendees`)
        fetch(url)
        .then(reponse => reponse.json())
        .then(
            data => {
                attendeesAll = data.attendees
                setTotal(data.totalAttendees)
                if (search === '') 
                    {setAttenddesFilter(data.attendees)}
                    else {searching()}
                
            }
        )}, 
        []
    )
    
    function onSearchInputChanged(event: ChangeEvent<HTMLInputElement>) {
        setCurrentSearch(event.target.value.toLocaleLowerCase())
        setCurrentPage(1)
    }

    function searching() {
        if (search !== ''){
            const result = [] as Attendee[]
            console.log(attendeesAll)
            attendeesAll.map((attendee)=>{
                if (attendee.name.toString().toLocaleLowerCase().indexOf(search) >= 0){
                    result.push(attendee)
                }
            })
            setAttenddesFilter(result)
            setTotal(result.length)
        } else {
            setAttenddesFilter(attendeesAll)
            setTotal(attendeesAll.length)
        }    
    }

    useEffect(() => {searching()}, [search])

    function setCurrentSearch (search:string) {
        const url = new URL(window.location.toString())
        url.searchParams.set('search', search)
        window.history.pushState({}, "", url)
        setSearch(search)
    }

    function setCurrentPage(page: number) {
        const url = new URL(window.location.toString())
        url.searchParams.set('page', String(page))
        window.history.pushState({}, "", url)
        setPage(page)
    }

    function goToNextPage() {setCurrentPage(page+1)}
    function goToPreviusPage() {setCurrentPage(page-1)}
    function goToLastPage() {setCurrentPage(totalPage)}
    function goToFirstPage() {setCurrentPage(1)}

    return (
        <div className='flex flex-col gap-4'>
            <div className="flex gap-3 items-center">
                <h1 className="text-2xl font-bold">Participantes</h1>
                <div className="px-3 w-72 py-1.5 border border-white/10 rounded-lg flex items-center gap-3" >
                    <Search className='size-4 text-emerald-300' />    
                    <input 
                        onChange={onSearchInputChanged} 
                        value={search}
                        className="bg-transparent flex-1 outline-none border-0 p-0 text-sm focus:ring-0" 
                        placeholder="Buscar participantes..." />
                </div>
            </div>

            <Table>
                <thead>
                    <TableRow>
                        <TableHeader style={{ width: 48 }}>
                            <input type="checkbox" className='size-4 bg-black/20 rounded border-white/10' />
                        </TableHeader>
                        <TableHeader>Código</TableHeader>
                        <TableHeader>Participantes</TableHeader>
                        <TableHeader>Data de inscrição</TableHeader>
                        <TableHeader>Data do Check-in</TableHeader>
                        <TableHeader style={{ width: 64 }}></TableHeader>
                    </TableRow>
                </thead>
                <tbody>
                    {attendeesFilter.slice((page-1) * 10, (page) *10).map((attendee)=>{
                        return (
                            <TableRow key={attendee.id}>
                                <TableCell>
                                    <input type="checkbox" className='size-4 bg-black/20 rounded border-white/10' />
                                </TableCell>
                                <TableCell>{attendee.id}</TableCell>
                                <TableCell>
                                    <div className='flex flex-col gap-1'>
                                        <span className='font-semibold text-white'>{attendee.name}</span>
                                        <span>{attendee.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{dayjs().to(attendee.createdAt)}</TableCell>
                                <TableCell>{attendee.checkedInAt === null
                                    ? <span className='text-zinc-400'>Não fez check-in</span>
                                    : dayjs().to(attendee.checkedInAt)
                                }</TableCell>
                                <TableCell>
                                    <IconButton transparente >
                                        <MoreHorizontal  className='size-4' />
                                    </IconButton>
                                </TableCell>                                    
                            </TableRow>
                        )
                    })}
                </tbody>
                <tfoot>
                    <TableRow>
                        <TableCell colSpan={3}>Mostrando {attendeesFilter.length > 10 ? 10 : attendeesFilter.length} de {totalRows}</TableCell>
                        <td className='py-3 px-4 text-sm text-zinc-300 text-right' colSpan={3}>
                            <div className='inline-flex items-center gap-8 '>

                                <span>Página {page} de {totalPage}</span>
                                
                                <div className='flex gap-1.5'>
                                    <IconButton onClick={goToFirstPage} disabled={page===1} >
                                        <ChevronsLeft  className='size-4' />
                                    </IconButton>
                                    <IconButton onClick={goToPreviusPage} disabled={page===1} >
                                        <ChevronLeft  className='size-4' />
                                    </IconButton>
                                    <IconButton onClick={goToNextPage} disabled={page===totalPage}>
                                        <ChevronRight  className='size-4' />
                                    </IconButton>
                                    <IconButton onClick={goToLastPage} disabled={page===totalPage}>
                                        <ChevronsRight  className='size-4' />
                                    </IconButton>
                                </div>
                            </div>
                        </td>
                    </TableRow>
                </tfoot>
            </Table>
        </div>
    )
}