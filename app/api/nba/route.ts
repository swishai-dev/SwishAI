import { NextRequest, NextResponse } from "next/server";
import { NBAService } from "@/lib/services/nba";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type") || "all";
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");

  try {
    if (type === "games") {
      const allGames = await NBAService.getGames(search);
      const total = allGames.length;
      const games = allGames.slice((page - 1) * pageSize, page * pageSize);
      return NextResponse.json({ 
        games, 
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      });
    } else if (type === "props") {
      const allProps = await NBAService.getProps(search);
      const total = allProps.length;
      const props = allProps.slice((page - 1) * pageSize, page * pageSize);
      return NextResponse.json({ 
        props, 
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      });
    } else if (type === "all") {
      // Fetch both games and props
      const [allGames, allProps] = await Promise.all([
        NBAService.getGames(search),
        NBAService.getProps(search)
      ]);
      
      return NextResponse.json({ 
        games: allGames,
        props: allProps,
        totalGames: allGames.length,
        totalProps: allProps.length
      });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
