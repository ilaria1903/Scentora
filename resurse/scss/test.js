


function f(x,y){
    console.log(typeof(y))
    return 2*x
}
function f(x){
    console.log(arguments)
    return 2*x
}

a=10;b=15
for(i=a;i<=f(b,17);i++)
    console.log("i="+i)


let sir = ""; 

for (let i = 0; i < 5; i++) {          
    for (let j = 0; j < 5; j++) {      
        sir += "*";
    }
    sir += "\n"; 
}

console.log(sir);
