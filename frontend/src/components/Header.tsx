import SecondaryButton from "./SecondaryButton";

export default function Header() {
    return (
        <header  className="pl-56 pr-56 pt-8 pb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <img src="lisa-logo.png" alt="Logo" style={{ height: '4rem' }} />
            </div>
           <SecondaryButton text="0xa3..23fa" icon= {"active.svg"}/>
        </header>
    );
}
