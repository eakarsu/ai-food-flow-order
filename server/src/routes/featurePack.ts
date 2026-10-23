import {Router} from "express";
import {authenticateToken,type AuthRequest} from "../middleware/auth.js";
import {query} from "../config/database.js";
import {filterOrders,ordersToCsv,buildOrderInsights,parseTaskStatus,parseTaskPriority} from "../featurePack.js";
const router=Router();
router.use(authenticateToken);
async function ownOrders(req:AuthRequest){
  const r=await query(`SELECT o.id,o.order_number,o.status,o.total_amount,o.created_at,r.name AS restaurant_name FROM orders o LEFT JOIN restaurants r ON r.id=o.restaurant_id WHERE o.user_id=$1 ORDER BY o.created_at DESC LIMIT 500`,[req.user!.id]);
  return r.rows;
}
router.get("/orders/search",async(req:AuthRequest,res,next)=>{try{return res.json({orders:filterOrders(await ownOrders(req),{q:String(req.query.q||""),status:String(req.query.status||"")}),aiGenerated:false});}catch(e){next(e);}});
router.get("/orders/export",async(req:AuthRequest,res,next)=>{try{const rows=filterOrders(await ownOrders(req),{q:String(req.query.q||""),status:String(req.query.status||"")});if(String(req.query.format||"json").toLowerCase()==="csv"){res.type("text/csv").set("Content-Disposition","attachment; filename=orders.csv");return res.send(ordersToCsv(rows));}return res.json({orders:rows,aiGenerated:false});}catch(e){next(e);}});
router.get("/orders/insights",async(req:AuthRequest,res,next)=>{try{return res.json(buildOrderInsights(await ownOrders(req)));}catch(e){next(e);}});
router.get("/tasks",async(req:AuthRequest,res,next)=>{try{const st=parseTaskStatus(String(req.query.status||""));const r=st?await query("SELECT * FROM staff_tasks WHERE status=$1 ORDER BY due_at ASC NULLS LAST,created_at DESC LIMIT 200",[st]):await query("SELECT * FROM staff_tasks ORDER BY created_at DESC LIMIT 200");return res.json({tasks:r.rows});}catch(e){next(e);}});
router.post("/tasks",async(req:AuthRequest,res,next)=>{try{const title=typeof req.body?.title==="string"?req.body.title.trim():"";if(!title)return res.status(422).json({error:"title is required"});const r=await query("INSERT INTO staff_tasks(title,description,priority,due_at,created_by) VALUES($1,$2,$3,$4,$5) RETURNING *",[title.slice(0,200),typeof req.body?.description==="string"?req.body.description.slice(0,2000):null,parseTaskPriority(req.body?.priority),req.body?.dueAt||null,req.user!.id]);return res.status(201).json({task:r.rows[0]});}catch(e){next(e);}});
router.patch("/tasks/:id",async(req:AuthRequest,res,next)=>{try{const st=req.body?.status===undefined?undefined:parseTaskStatus(String(req.body.status));if(req.body?.status!==undefined&&!st)return res.status(422).json({error:"status must be OPEN, DONE, or CANCELLED"});const ex=await query("SELECT * FROM staff_tasks WHERE id=$1",[req.params.id]);if(!ex.rows[0])return res.status(404).json({error:"Task not found"});const r=await query("UPDATE staff_tasks SET status=$1,completed_at=$2,updated_at=NOW() WHERE id=$3 RETURNING *",[st??ex.rows[0].status,st==="DONE"?new Date():st?null:ex.rows[0].completed_at,req.params.id]);return res.json({task:r.rows[0]});}catch(e){next(e);}});
export default router;
