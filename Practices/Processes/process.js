let count = 0;
let intervalId = null;
let test = ()=>{
  let res = 0;
  count++;
  for(let i= 0 ; i < 1000; i ++){
    if(i%2 == 0) res += i;
  }
  console.log("Testing process", res);
  if(count >=5){
    process.exit();
  } 
  // clearInterval(intervalId)
}
process.on('beforeExit', (status)=>{
  console.log('process on beforeExit status:', status)
})
process.on('exit', (code) => {
  console.log(`About to exit with code: ${code}`);
});
intervalId = setInterval(test, 1200);