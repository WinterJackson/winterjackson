import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // 1. Create Admin User
    const hashedPassword = await bcrypt.hash('admin123', 12)
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@winterjackson.com' },
        update: {},
        create: {
            email: 'admin@winterjackson.com',
            name: 'Winter Jackson',
            password: hashedPassword,
        },
    })
    console.log('✅ Admin user:', adminUser.email)

    // 2. Profile
    await prisma.profile.upsert({
        where: { id: 'default-profile' },
        update: {},
        create: {
            id: 'default-profile',
            name: 'Winter Jackson',
            title: 'Software Developer',
            email: 'winterjacksonwj@gmail.com',
            phone: '+254 795 213 399',
            location: 'Nairobi, Kenya',
            bio: 'An experienced software developer proficient in analyzing, modifying, and designing end-user applications tailored to specific needs. Skilled in Python, React JS, Next JS, and common libraries for development and testing.',
            github: 'https://github.com/WinterJackson',
            linkedin: 'https://linkedin.com/in/winterjackson',
        },
    })
    console.log('✅ Profile synced')

    // Clean up existing data to avoid duplicates for lists
    await prisma.project.deleteMany()
    await prisma.service.deleteMany()
    await prisma.experience.deleteMany()
    await prisma.education.deleteMany()
    await prisma.skill.deleteMany()
    await prisma.testimonial.deleteMany()

    await prisma.client.deleteMany()

    // 3. Projects
    await prisma.project.createMany({
        data: [
            {
                title: 'Vepo Clear Water',
                category: 'web development',
                categories: ['web development'],
                imageUrl: '/images/vepo.jpg',
                webpUrl: '/images/vepo.webp',
                description: 'Vepo Clear Water project entails the creation of an application dedicated to vending bottled, purified, drinking water. This ongoing development focuses on crafting an intuitive and efficient platform to streamline the process of accessing clean drinking water for users. From ensuring user-friendly interfaces to implementing secure payment systems, the project aims to deliver a seamless experience for both vendors and consumers alike.',
                demoUrl: 'https://tech-boffin.github.io/vepo-landing-page/',
                order: 1,
            },
            {
                title: 'Plutus Capital',
                category: 'web development',
                categories: ['web development'],
                imageUrl: '/images/plutus-capital.jpg',
                webpUrl: '/images/plutus-capital.webp',
                description: 'Worked together in a team project at Plutus Capital, crafting an advanced web platform for managing investments. Tasks involved creating backend algorithms and ensuring seamless integration between frontend and backend systems. Employed technologies like Python, Flask, SQL, and JavaScript. Produced a user-focused application that enhances investment strategies. Future objectives encompass integrating machine learning and broadening product offerings.',
                demoUrl: 'https://plutus.co.ke/',
                githubUrl: 'https://github.com/WinterJackson/Plutus_Capital',
                order: 2,
            },
            {
                title: 'BTS Sizing Tool',
                category: 'applications',
                categories: ['applications'],
                imageUrl: '/images/bts-sizing-tool.jpg',
                webpUrl: '/images/bts-sizing-tool.webp',
                description: 'For a client, I developed a specialized calculator tool to streamline solar panel installations. This Python-based application, utilizing the tkinter library for UI styling, offered two primary functionalities: calculating the required number of solar panels and determining the appropriate battery specifications for each project. By inputting specific project requirements, users could obtain accurate estimations for panel quantity and battery size, facilitating efficient planning and execution of solar energy systems.',
                githubUrl: 'https://github.com/WinterJackson/BTS-Sizing-Tool',
                order: 3,
            },
            {
                title: 'Yikes YouTube Downloader',
                category: 'applications',
                categories: ['applications', 'personal projects'],
                imageUrl: '/images/yikes-ytd.jpg',
                webpUrl: '/images/yikes-ytd.webp',
                description: 'Yikes YTD is my latest personal project, a versatile YouTube video downloader application designed to download both individual videos and entire playlists. Currently functional on Linux platforms, the application is undergoing development for compatibility with Windows and iOS. To accelerate its progress, I\'ve made the project open-source, inviting contributions from fellow developers. This collaborative approach fosters innovation and ensures the project\'s continued enhancement and accessibility across various platforms.',
                demoUrl: 'https://winterjackson.github.io/site-yikes-ytd/index.html',
                githubUrl: 'https://github.com/WinterJackson/Yikes-YTD',
                order: 4,
            },
            {
                title: 'AllCurrency',
                category: 'personal projects',
                categories: ['personal projects'],
                imageUrl: '/images/acc.jpg',
                webpUrl: '/images/acc.webp',
                description: 'AllCurrency was one of my early projects, developed as a platform to provide comprehensive information about global cryptocurrencies. Leveraging a free API, the platform offered users access to real-time exchange rates, historical exchange rate data, and a currency converter tool. Despite being one of my initial projects during the learning phase, it served as an invaluable opportunity to gain practical experience in web development and API integration.',
                demoUrl: 'https://all-currency-crypto.vercel.app/',
                githubUrl: 'https://github.com/WinterJackson/allCurrencyCrypto',
                order: 5,
            },
        ],
    })
    console.log('✅ Projects seeded')

    // 4. Services (What I Do + Personal Ventures)
    await prisma.service.createMany({
        data: [
            // What I Do
            {
                title: 'Frontend Development',
                description: 'Well thought out User Interfaces for web applications to enhance the User Experience effectively.',
                iconUrl: '/images/front-dev.png',
                order: 1,
                category: 'service',
            },
            {
                title: 'Backend Development',
                description: 'Effective backend development for data security and proper data storage.',
                iconUrl: '/images/back-dev.png',
                order: 2,
                category: 'service',
            },
            {
                title: 'Mobile apps',
                description: 'Effective development of applications for both iOS and Android systems.',
                iconUrl: '/images/phone-app.png',
                order: 3,
                category: 'service',
            },
            {
                title: 'API Development',
                description: 'Development of the Application Programming Interface to enhance effective communication between the servers and the clients.',
                iconUrl: '/images/api.png',
                order: 4,
                category: 'service',
            },
            // Personal Ventures
            {
                title: 'Artificial Intelligence',
                description: 'Together with Machine Learning, Artificial Intelligence has imensely impacted the tech world.',
                iconUrl: '/images/artificial-intelligence.png',
                order: 5,
                category: 'venture',
            },
            {
                title: 'Cyber Security',
                description: 'As data greatly becomes the gold mine for people in the tech world, cyber security has now been more on demand than ever.',
                iconUrl: '/images/robotics.png',
                order: 6,
                category: 'venture',
            },
        ],
    })
    console.log('✅ Services seeded')

    // 5. Experience
    await prisma.experience.createMany({
        data: [
            {
                jobTitle: 'Junior Software Developer.',
                company: 'Snark Health',
                startDate: 'April 2024',
                endDate: 'Current',
                description: 'Updating the Android App: Adapting the app to the latest Next.js framework and deploying the dashboard.\n\nHospital Search: Adding the hospital search feature and booking functionality.\n\nEMR Integration: Connecting the app with the EMR dashboard for seamless communication.\n\nKPIs and Analytics: Tracking and analyzing key performance indicators.\n\nDashboard Implementation: Developing a dashboard for hospitals to manage patients.\n\nWriting clean, maintainable code in accordance with well-known coding standards and best practices.',
                order: 1,
            },
            {
                jobTitle: 'Junior Software Developer.',
                company: 'Vepo Clear Water Ltd.',
                startDate: 'September 2023',
                endDate: 'March 2024',
                description: 'Participating in the design, development, and testing of a sales and production automation application.\n\nCollaborating with other software engineers to execute project requirements and translate them into technical specifications.\n\nImplementing new features and functionalities to the automated application as outlined in the project roadmap.\n\nTroubleshooting and debugging issues to ensure smooth operation of the application.\n\nWorking closely with cross-functional teams, such as sales, production, and quality assurance, to gather requirements, and insights and address concerns.\n\nProviding technical support to end-users as needed.',
                order: 2,
            },
            {
                jobTitle: 'Data Analyst Intern.',
                company: 'Apollo Agriculture',
                startDate: 'October 2021',
                endDate: 'April 2022',
                description: 'Collaborating with other colleagues in the management of each farmer\'s information.\n\nData Collection. Gathering and cleaning data from various sources, including customer transactions, credit applications, and agricultural training records.\n\nPrinting of reports for analysis of the data collected.\n\nAnalyzing customer insights and feedback to enhance product improvements and better customer engagement strategies.',
                order: 3,
            },
            {
                jobTitle: 'Credit Analyst',
                company: 'Momentum Credit Ltd.',
                startDate: 'March 2021',
                endDate: 'September 2021',
                description: 'Analyzing financial data, such as income statements, balance sheets, and cash flow statements, to evaluate the applicant\'s financial health.\n\nAssessing the creditworthiness of individuals or businesses applying for loans or credit lines.\n\nReviewing credit history, payment records, and credit scores to determine the applicant\'s repayment capacity and risk profile.',
                order: 4,
            },
            {
                jobTitle: 'Merchandiser / Brand Ambassador',
                company: 'Swivel Marketing Agency',
                startDate: 'February 2019',
                endDate: 'January 2020',
                description: 'Representing the brands being marketed positively in different marketing strategies carried out.\n\nParticipating in event planning aimed at marketing the brands and making sure the events run smoothly.\n\nIssuing and keeping track of the available marketing merchandise used.',
                order: 5,
            },
            {
                jobTitle: 'Attachment, Supply Chain Mgt. Department',
                company: 'Kenya National Treasury',
                startDate: 'September 2018',
                endDate: 'November 2018',
                description: 'Keeping records of inventory in the National Treasury stores.\n\nRetrieval and issuance of stored items from the stores to the authorized personnel.\n\nClearance and collecting of returned items to the stores by the authorized staff.',
                order: 6,
            },
        ],
    })
    console.log('✅ Experience seeded')

    // 6. Education
    await prisma.education.createMany({
        data: [
            {
                institution: 'Moringa School, Nairobi',
                degree: 'Software Engineering',
                field: 'Software Engineering',
                startDate: 'May 2023',
                endDate: 'November 2024',
                order: 1,
            },
            {
                institution: 'European Business University, Luxembourg',
                degree: 'Certificate',
                field: 'Management Information Systems',
                startDate: 'September 2022',
                endDate: 'March 2023',
                order: 2,
            },
            {
                institution: 'Kenyatta University, Nairobi',
                degree: 'BSc. Commerce',
                field: 'Procurement & Supply Chain Management',
                startDate: 'September 2016',
                endDate: 'July 2022',
                order: 3,
            },
        ],
    })
    console.log('✅ Education seeded')

    // 7. Skills
    await prisma.skill.createMany({
        data: [
            { name: 'JavaScript', percentage: 90, category: 'frontend', order: 1, iconUrl: 'logo-javascript' },
            { name: 'React', percentage: 85, category: 'frontend', order: 2, iconUrl: 'logo-react' },
            { name: 'Next.js', percentage: 80, category: 'frontend', order: 3, iconUrl: '' },
            { name: 'Node.js', percentage: 75, category: 'backend', order: 4, iconUrl: 'logo-nodejs' },
            { name: 'Python', percentage: 70, category: 'backend', order: 5, iconUrl: 'logo-python' },
            { name: 'PostgreSQL', percentage: 75, category: 'database', order: 6, iconUrl: '' },
            { name: 'Git', percentage: 85, category: 'tools', order: 7, iconUrl: 'git-branch-outline' },
            { name: 'Docker', percentage: 60, category: 'tools', order: 8, iconUrl: 'cube-outline' },
        ],
    })
    console.log('✅ Skills seeded')

    // 8. Clients
    await prisma.client.createMany({
        data: [
            { name: 'AllCurrency', logoUrl: '/images/allCurrency-logo.webp', order: 1, isActive: true },
            { name: 'Plutus', logoUrl: '/images/plutus-logo.webp', order: 2, isActive: true },
            { name: 'Vepo', logoUrl: '/images/vepo-logo.webp', order: 3, isActive: true },
            { name: 'Yikes', logoUrl: '/images/yikes-logo.webp', order: 4, isActive: true },
        ]
    })
    console.log('✅ Clients seeded')

    // 8. Testimonials
    await prisma.testimonial.createMany({
        data: [
            {
                name: 'Jeremy Omare',
                role: 'Renewable Energy Professional.',
                company: 'Best Energy',
                text: '"Exceptional service! Jackson provided unparalleled expertise and support throughout the entire development process. The attention to detail and commitment to delivering high-quality results exceeded my expectations. I highly recommend the services to anyone looking for top-notch tech solutions."',
                avatarUrl: '/images/user.png',
                linkedinUrl: 'https://www.linkedin.com/in/jeremyomare/',
                order: 1,
            } as any,
            {
                name: 'Nelson Lawrence',
                role: 'MD, Pinnacle Green Systems Ltd.',
                company: 'Pinnacle Green Systems Ltd.',
                text: '"Working with Winter Jackson, on my project has been a positive experience so far. The collaborative nature and innovative solutions have made the development process smooth and efficient. Looking forward to the project\'s completion!"',
                avatarUrl: '/images/user.png',
                linkedinUrl: 'https://www.linkedin.com/in/nelson-lawrence-91bb2671/',
            } as any,
            {
                name: 'Kimathi I.',
                role: 'Investment Manager',
                company: 'Plutus Capital',
                text: '"Absolutely reliable and highly efficient! Not only was our project completed well ahead of schedule, but the quality of work delivered surpassed the expectations. Exceptional service from start to finish!"',
                avatarUrl: '/images/user.png',
                linkedinUrl: 'https://www.linkedin.com/in/ikiao/',
            } as any,
        ],
    })
    console.log('✅ Testimonials seeded')

    console.log('\n🎉 Seed completed successfully!')
}

main()
    .catch((e) => {
        console.error('❌ Error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
