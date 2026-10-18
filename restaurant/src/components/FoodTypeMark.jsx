import {cn} from "@/lib/utils"

const STYLES = {
    VEG : ["border-green-600", "bg-green-600", "Veg"],
    NON_VEG : ["border-red-600", "bg-red-600", "Non-Veg"],
    EGG : ["border-yellow-600", "bg-yellow-600", "Egg"]
}

export function FoodTypeMark({type, className}) {
    const [border, fill, label] = STYLES[type] ?? STYLES.VEG;
    return(
        <span  role="img" aria-label={label} className={cn("inline-flex size-3.5 shrink-0 items-center justify-center border", border, className)}>
            <span className={cn("size-1.5 rounded-full", fill)}/>
        </span>
    ) 
}