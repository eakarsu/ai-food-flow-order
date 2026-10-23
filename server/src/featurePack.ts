// Feature pack: order search/filter, CSV/JSON export, deterministic insights, staff tasks helpers.
// Offline only: never calls a provider. Insights are labelled aiGenerated:false.
export type OrderRow={id?:unknown;order_number?:unknown;status?:unknown;restaurant_name?:unknown;total_amount?:unknown;[k:string]:unknown};
export function filterOrders(rows:OrderRow[],{q="",status=""}:{q?:string;status?:string}={}):OrderRow[]{
  const needle=String(q||"").trim().toLowerCase();
  return (rows||[]).filter(r=>{
    if(status&&String(r.status||"")!==status)return false;
    if(!needle)return true;
    return [r.order_number,r.status,r.restaurant_name,r.id].join(" ").toLowerCase().includes(needle);
  });
}
const cell=(v:unknown)=>`"${String(v??"").replace(/"/g,'""')}"`;
export function ordersToCsv(rows:OrderRow[]):string{
  const head=["id","order_number","status","restaurant_name","total_amount","created_at"];
  return [head.join(","),...(rows||[]).map(r=>head.map(k=>cell(r[k])).join(","))].join("\n")+"\n";
}
export function buildOrderInsights(rows:OrderRow[]){
  const list=rows||[];
  const total=list.reduce((s,r)=>s+(Number(r.total_amount)||0),0);
  const cancelled=list.filter(r=>r.status==="cancelled").length;
  const active=list.filter(r=>!["delivered","cancelled"].includes(String(r.status||""))).length;
  const mk=(id:string,title:string,summary:string,metrics:{label:string;value:number}[])=>({id,title,aiGenerated:false as const,provider:"Deterministic fallback (offline)",summary,metrics,sections:[{title:"Labelled detail",detail:summary},{title:"Orders reviewed",detail:`Orders reviewed: ${list.length}`}]});
  return {aiGenerated:false as const,provider:"Deterministic fallback (offline)",disclaimer:"Deterministic summary of your own orders only; no provider was called.",insights:[
    mk("order-volume","Order volume and value",`Orders reviewed: ${list.length}; total order value: ${total.toFixed(2)}; active orders: ${active}.`,[{label:"Orders reviewed",value:list.length},{label:"Active orders",value:active}]),
    mk("cancellation-risk","Cancellation summary",`Orders reviewed: ${list.length}; cancelled orders: ${cancelled}; cancellation rate: ${list.length?Math.round(cancelled/list.length*100):0}%.`,[{label:"Cancelled orders",value:cancelled}]),
    mk("restaurant-mix","Restaurant mix",`Orders reviewed: ${list.length}; distinct restaurants: ${new Set(list.map(r=>String(r.restaurant_name||""))).size}.`,[{label:"Distinct restaurants",value:new Set(list.map(r=>String(r.restaurant_name||""))).size}]),
  ]};
}
export function parseTaskStatus(v:unknown){return v==="OPEN"||v==="DONE"||v==="CANCELLED"?v:null;}
export function parseTaskPriority(v:unknown){return v==="LOW"||v==="HIGH"?v:"NORMAL";}
