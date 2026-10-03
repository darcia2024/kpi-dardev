const officeTypes:Record<string,{extension:string;entry:string}>={
 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':{extension:'.docx',entry:'word/document.xml'},
 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':{extension:'.xlsx',entry:'xl/workbook.xml'},
 'application/vnd.openxmlformats-officedocument.presentationml.presentation':{extension:'.pptx',entry:'ppt/presentation.xml'}
};
export function validateOfficeFile(name:string,mime:string,bytes:Uint8Array):boolean{
 const type=officeTypes[mime];if(!type||!name.toLowerCase().endsWith(type.extension))return false;
 const b=Buffer.from(bytes);if(b.length<22||b.readUInt32LE(0)!==0x04034b50)return false;
 let end=-1;for(let i=b.length-22;i>=Math.max(0,b.length-65557);i--)if(b.readUInt32LE(i)===0x06054b50&&i+22+b.readUInt16LE(i+20)===b.length){end=i;break;}
 if(end<0||b.readUInt16LE(end+4)!==0||b.readUInt16LE(end+6)!==0)return false;
 const count=b.readUInt16LE(end+10),start=b.readUInt32LE(end+16),size=b.readUInt32LE(end+12);
 if(!count||count>2000||count!==b.readUInt16LE(end+8)||start+size!==end)return false;
 let offset=start,total=0;const names=new Set<string>();
 try{for(let i=0;i<count;i++){
  if(offset+46>end||b.readUInt32LE(offset)!==0x02014b50)return false;
  const flags=b.readUInt16LE(offset+8),method=b.readUInt16LE(offset+10),compressed=b.readUInt32LE(offset+20),uncompressed=b.readUInt32LE(offset+24),len=b.readUInt16LE(offset+28),extra=b.readUInt16LE(offset+30),comment=b.readUInt16LE(offset+32),local=b.readUInt32LE(offset+42);
  if(flags&1||![0,8].includes(method)||offset+46+len+extra+comment>end||local+30>start||b.readUInt32LE(local)!==0x04034b50)return false;
  const entry=new TextDecoder('utf-8',{fatal:true}).decode(b.subarray(offset+46,offset+46+len));
  if(names.has(entry)||entry.includes('..')||entry.includes('\\')||entry.startsWith('/')||/vbaproject|activex|embeddings\//i.test(entry))return false;
  const localLen=b.readUInt16LE(local+26),localExtra=b.readUInt16LE(local+28);
  if(local+30+localLen+localExtra+compressed>start||b.readUInt16LE(local+6)!==flags||b.readUInt16LE(local+8)!==method||b.subarray(local+30,local+30+localLen).compare(b.subarray(offset+46,offset+46+len))!==0)return false;
  total+=uncompressed;if(total>40_000_000||uncompressed>10_000_000||(uncompressed>1_000_000&&uncompressed/Math.max(1,compressed)>150))return false;
  names.add(entry);offset+=46+len+extra+comment;
 }
 return offset===end&&names.has('[Content_Types].xml')&&names.has('_rels/.rels')&&names.has(type.entry);
 }catch{return false;}
}
