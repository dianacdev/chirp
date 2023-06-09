import { type NextPage } from "next";
import Head from "next/head";

import { SignInButton, useUser} from "@clerk/nextjs";

import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';
import Image from "next/image";
import { LoadingPage } from "~/components/loading";

dayjs.extend(relativeTime);

const CreatePostWizard = () =>{
  const {user} = useUser();
  console.log(user);

  if (!user) return null;

  return( 
    <div className="flex gap-3 w-full">
      <Image src={user.profileImageUrl} alt={`@${user.username}'s profile picture`} className="rounded-full" width={56} height={56}/>
      <input type="text" placeholder="Type some emojis!" className="bg-transparent grow outline-none"/>
    </div>
  )
}

type PostWithUser = RouterOutputs["posts"]["getAll"][number]

const PostView = (props:PostWithUser) =>{
  const {post, author} = props;
  return (
    <div key={post.id} className="p-4 border-b border-slate-400 flex gap-3">
      <Image src={author.profileImageUrl} alt={`@${author.username}'s profile picture`}  className=" rounded-full" width={56} height={56}/>
      <div className=" flex flex-col">
        <div className="flex text-slate-400 gap-1">
          <span>{`@${author.username}`}</span><span className="font-thin"> {` · ${dayjs(post.createdAt).fromNow()}`}</span>
        </div>
        <span className="text-2xl">{post.content}</span>
      </div>
    </div>
  )
}

const Feed = () => {
  const {data, isLoading:postsLoading} = api.posts.getAll.useQuery();

  if(postsLoading) return <LoadingPage/>

  if(!data) return <div>Something went wrong</div>

  return (
    <div className="flex flex-col">
    {data?.map((fullPost)=>(
      <PostView {...fullPost} key={fullPost.post.id}/>
    ))}
  </div>
  )
}

const Home: NextPage = () => {

  const {isLoaded:userLoaded, isSignedIn} = useUser();

  //Start fetching asap
  api.posts.getAll.useQuery();

  //Returns an empty div if user isn't loaded
  if (!userLoaded) return <div/>

  return (
    <>
      <Head>
        <title>Chirp</title>
        <meta name="description" content="Chirp, Twitter inspired site with emojis" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center h-screen">
        <div className="h-full w-full border-x border-slate-400 md:max-w-2xl">
          <div className="flex border-b border-slate-400 p-4">
            {!isSignedIn && <div className="flex justify-center"><SignInButton/></div>}
            {isSignedIn && <CreatePostWizard/>}
          </div>

          <Feed/>

        </div>
      </main>
    </>
  );
};

export default Home;
