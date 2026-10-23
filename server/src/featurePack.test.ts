import test from "node:test";
import assert from "node:assert/strict";
import {filterOrders,ordersToCsv,buildOrderInsights,parseTaskStatus} from "./featurePack.js";
const rows=[{id:"1",order_number:"ORD-1",status:"pending",restaurant_name:"Alpha",total_amount:0},{id:"2",order_number:"ORD-2",status:"cancelled",restaurant_name:"Beta",total_amount:10}];
test("filterOrders searches and filters orders",()=>{assert.equal(filterOrders(rows,{q:"alpha"}).length,1);assert.equal(filterOrders(rows,{status:"cancelled"}).length,1);});
test("ordersToCsv preserves 0",()=>{assert.ok(ordersToCsv(rows).includes('"0"'));});
test("buildOrderInsights labelled fallback incl empty",()=>{const o=buildOrderInsights(rows);assert.equal(o.aiGenerated,false);assert.equal(o.insights.length,3);assert.ok(buildOrderInsights([]).insights[0].summary.includes("Orders reviewed: 0"));});
test("parseTaskStatus strict",()=>{assert.equal(parseTaskStatus("DONE"),"DONE");assert.equal(parseTaskStatus("X"),null);});
