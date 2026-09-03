import { NextRequest, NextResponse } from "next/server";

type Annotation={hotspotId:string;label:string;health:string;by:string;note?:string};
type Explorer={id:string;name:string;color:string;lastSeen:number};
type Room={code:string;explorers:Explorer[];annotations:Record<string,Annotation>;updatedAt:number};
const colors=["#63f2d3","#ffd36f","#78a8ff","#ff8f82","#bc92ff"];
const rooms=(()=>{const root=globalThis as typeof globalThis&{__reefExplorerRooms?:Map<string,Room>};root.__reefExplorerRooms??=new Map<string,Room>();return root.__reefExplorerRooms})();
function roomFor(raw:string){const code=(raw||"DIVE1").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,6)||"DIVE1";if(!rooms.has(code))rooms.set(code,{code,explorers:[],annotations:{},updatedAt:Date.now()});return rooms.get(code)!}
function touch(room:Room,id:string,name:string){const now=Date.now();room.explorers=room.explorers.filter(e=>now-e.lastSeen<120000);const existing=room.explorers.find(e=>e.id===id);if(existing){existing.name=name;existing.lastSeen=now}else room.explorers.push({id,name,color:colors[room.explorers.length%colors.length],lastSeen:now})}
export async function GET(request:NextRequest){return NextResponse.json(roomFor(request.nextUrl.searchParams.get("code")||"DIVE1"),{headers:{"cache-control":"no-store"}})}
export async function POST(request:NextRequest){
 const room=roomFor(request.nextUrl.searchParams.get("code")||"DIVE1"),body=await request.json() as Record<string,unknown>,id=String(body.id||"guest"),name=String(body.name||"Explorer").slice(0,24);
 if(body.type==="join"||body.type==="presence")touch(room,id,name);
 if(body.type==="annotate"){touch(room,id,name);const hotspotId=String(body.hotspotId||"");if(hotspotId)room.annotations[hotspotId]={hotspotId,label:String(body.label||"Observed"),health:String(body.health||"Unreviewed"),by:name}}
 if(body.type==="note"){const hotspotId=String(body.hotspotId||"");if(hotspotId){room.annotations[hotspotId]??={hotspotId,label:String(body.label||"Observed colony"),health:String(body.health||"Unreviewed"),by:name};room.annotations[hotspotId].note=String(body.note||"").slice(0,180)}}
 if(body.type==="reset")room.annotations={};
 room.updatedAt=Date.now();return NextResponse.json(room,{headers:{"cache-control":"no-store"}})
}
