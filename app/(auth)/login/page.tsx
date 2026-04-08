import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LuGithub } from "react-icons/lu";

const LogIn = () => {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Welcome back!</CardTitle>
          <CardDescription>Login with your Github Email Accout</CardDescription>
        </CardHeader>

        <CardContent>
          <Button className="w-full" variant={"outline"}>
            <LuGithub />
            Sign in with Github
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogIn;
