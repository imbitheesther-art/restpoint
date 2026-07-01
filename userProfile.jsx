import React from "react";

const UserProfile = () => {
    const [user,setUser] = React.useState(null);
    React.useEffect(()=>{
        try{const u=JSON.parse(localStorage.getItem("user")||"{}");setUser(u);}catch(e){}
    },[]);
    const n = user?.full_name||user?.name||user?.username||"User";
    const r = user?.role||"";
    const gi = (n)=>n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2);
    return React.createElement("div",{style:{display:"flex",alignItems:"center",gap:"12px",padding:"8px 16px",background:"#FFFFFF",borderBottom:"1px solid #E8ECF0",justifyContent:"flex-end",position:"sticky",top:0,zIndex:40}},
        React.createElement("div",{style:{display:"flex",alignItems:"center",gap:"8px",padding:"4px 8px"}},
            React.createElement("div",{style:{width:"32px",height:"32px",borderRadius:"8px",background:"linear-gradient(135deg,#0A2463 0%,#1A3A7A 100%)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:600,fontSize:"12px"}},gi(n)),
            React.createElement("div",{style:{lineHeight:1.2}},
                React.createElement("div",{style:{fontSize:"13px",fontWeight:600,color:"#1A1D24"}},n),
                r && React.createElement("div",{style:{fontSize:"11px",color:"#6B7280"}},r)
            )
        )
    );
};
export default UserProfile;