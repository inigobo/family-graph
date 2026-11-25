import { mkdirSync } from 'node:fs';
import ladybug from '@ladybugdb/core';

mkdirSync('data', { recursive: true });
const db = new ladybug.Database('data/demo.lbdb');
const conn = new ladybug.Connection(db);
try {
  await conn.query('CREATE NODE TABLE IF NOT EXISTS Person(id STRING PRIMARY KEY, name STRING)');
  await conn.query('CREATE REL TABLE IF NOT EXISTS PARENT_OF(FROM Person TO Person)');
  await conn.query('CREATE REL TABLE IF NOT EXISTS PARTNER_OF(FROM Person TO Person)');
  await conn.query("MERGE (a:Person {id:'p1'}) SET a.name='Rowan'");
  await conn.query("MERGE (a:Person {id:'p2'}) SET a.name='Sky'");
  await conn.query("MERGE (a:Person {id:'p3'}) SET a.name='Ember'");
  await conn.query("MATCH (a:Person {id:'p1'}), (b:Person {id:'p2'}) MERGE (a)-[:PARENT_OF]->(b)");
  await conn.query("MATCH (a:Person {id:'p2'}), (b:Person {id:'p3'}) MERGE (a)-[:PARENT_OF]->(b)");
  const result = await conn.query('MATCH (g:Person)-[:PARENT_OF]->(:Person)-[:PARENT_OF]->(c:Person) RETURN g.name AS grandparent, c.name AS grandchild');
  console.table(await result.getAll());
} finally {
  await conn.close();
  await db.close();
}
