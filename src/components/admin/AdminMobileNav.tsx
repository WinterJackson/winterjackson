import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import styles from './AdminMobileNav.module.css'

export default function AdminMobileNav() {
  const router = useRouter()

  return (
    <div className={styles.nav}>
      <button 
        onClick={() => router.back()} 
        className={styles.arrowBtn}
        aria-label="Go Back"
      >
        <ArrowLeft size={24} />
      </button>
      
      <span className={styles.separator}>|</span>

      <button 
        onClick={() => router.forward()} 
        className={styles.arrowBtn}
        aria-label="Go Forward"
      >
        <ArrowRight size={24} />
      </button>
    </div>
  )
}
